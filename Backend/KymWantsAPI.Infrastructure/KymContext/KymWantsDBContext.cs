

using KymWantsAPI.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Pgvector;

namespace KymWantsAPI.Infrastructure.KymContext
{
    public class KymWantsDBContext : DbContext
    {

     public KymWantsDBContext(DbContextOptions<KymWantsDBContext> options): base(options) { }


        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Dish> Dishes { get; set; }
        public DbSet<Collection> Collections { get; set; }
        public DbSet<CollectionDish> CollectionDishes { get; set; }
        public DbSet<DocumentChunk> DocumentChunks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. ENABLE PGVECTOR EXTENSION
            modelBuilder.HasPostgresExtension("vector");
            // 1.2 VALUE COMPARER FOR float[]
            var floatArrayComparer = new ValueComparer<float[]>(
                (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToArray()
            );

            // 2. CONFIGURE DOCUMENT CHUNK VECTOR MAPPING & INDEX
            modelBuilder.Entity<DocumentChunk>(entity =>
            {
                entity.Property(dc => dc.Embedding)
                      .HasColumnType("vector(1024)")
                      .HasConversion(
                          v => new Vector(v),  // Convert float[] -> Pgvector.Vector
                          v => v.ToArray(),    // Convert Pgvector.Vector -> float[]
                          floatArrayComparer   // Pass ValueComparer as 3rd argument
                      );

                // Create HNSW index for fast similarity search
                entity.HasIndex(dc => dc.Embedding)
                      .HasMethod("hnsw")
                      .HasOperators("vector_cosine_ops");
            });
            // Defines the joint primary key for the Many-to-Many table
            modelBuilder.Entity<CollectionDish>()
                .HasKey(cd => new { cd.CollectionId, cd.DishId });
            // 2. INDEXES
            // Ensure Emails are strictly unique across the database
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            // Ensure Google IDs are unique, but ignore nulls (for password-only users)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.GoogleProviderId)
                .IsUnique()
                .HasFilter("google_provider_id IS NOT NULL");
            // Add indexes for foreign keys that will be queried frequently
            modelBuilder.Entity<Dish>()
                .HasIndex(d => d.CategoryId);

            modelBuilder.Entity<Collection>()
                .HasIndex(c => c.UserId);

            // 3. RELATIONSHIPS & DELETE BEHAVIORS
            modelBuilder.Entity<Collection>()
                .HasOne(c => c.User)
                .WithMany(u => u.Collections)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            // If a User is deleted -> DO NOT delete the Dishes they created (Restrict)
            // This keeps the dish available for others if it was added to shared collections
            modelBuilder.Entity<Dish>()
                .HasOne(d => d.CreatedByUser)
                .WithMany() // No inverse collection property on User to keep it clean
                .HasForeignKey(d => d.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // If a Category is deleted -> Throw an error if Dishes are attached (Restrict)
            // You shouldn't be able to delete "Main Dish" if 50 meals rely on it
            modelBuilder.Entity<Dish>()
                .HasOne(d => d.Category)
                .WithMany(c => c.Dishes)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // If a Collection OR Dish is deleted -> Delete the link between them
            modelBuilder.Entity<CollectionDish>()
                .HasOne(cd => cd.Collection)
                .WithMany(c => c.CollectionDishes)
                .HasForeignKey(cd => cd.CollectionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CollectionDish>()
                .HasOne(cd => cd.Dish)
                .WithMany(d => d.CollectionDishes)
                .HasForeignKey(cd => cd.DishId)
                .OnDelete(DeleteBehavior.Cascade);


            // 4. SEED DATA FOR CATEGORIES
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Main Course" },
                new Category { Id = 2, Name = "Appetizer" },
                new Category { Id = 3, Name = "Dessert" },
                new Category { Id = 4, Name = "Beverage" },
                new Category { Id = 5, Name = "Snack" },
                new Category { Id = 6, Name = "Side Dish" }
            );
        }
    }
}
