using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KymWantsAPI.Domain.Models
{
    [Table("document_chunks")]
    public class DocumentChunk
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("document_name", TypeName = "character varying")]
        [Required]
        [StringLength(255)]
        public string DocumentName { get; set; } = string.Empty;

        [Column("page_number")]
        public int PageNumber { get; set; }

        [Column("content")]
        [Required]
        public string Content { get; set; } = string.Empty;

        // Pure C# array - Zero external dependencies in Domain
        [Column("embedding")]
        public float[] Embedding { get; set; } = Array.Empty<float>();

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}