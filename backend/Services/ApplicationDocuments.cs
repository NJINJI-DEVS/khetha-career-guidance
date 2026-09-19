namespace CareerAdvisor.Api.Services;

// Private storage: never register this directory with UseStaticFiles.
public sealed class ApplicationDocuments
{
    private readonly string _root;
    public ApplicationDocuments(IWebHostEnvironment env, IConfiguration config)
    {
        _root = Path.GetFullPath(config["Documents:Path"] ?? Path.Combine(env.ContentRootPath, "App_Data", "mentor-documents"));
    }

    public static async Task<byte[]> ReadValidated(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0 || file.Length > 5 * 1024 * 1024)
            throw new ArgumentException("Documents must be between 1 byte and 5 MB.");
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream, ct);
        var bytes = stream.ToArray();
        var pdf = bytes.AsSpan().StartsWith("%PDF-"u8);
        var png = bytes.AsSpan().StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 });
        var jpg = bytes.AsSpan().StartsWith(new byte[] { 255, 216, 255 });
        if (!(pdf || png || jpg)) throw new ArgumentException("Only PDF, PNG and JPEG documents are accepted.");
        return bytes;
    }

    public string DocumentPath(Guid applicationId, string kind) => Path.Combine(_root, applicationId.ToString("N"), kind);
    public bool HasIdentity(Guid applicationId) => File.Exists(DocumentPath(applicationId, "identity"));
    public async Task Save(Guid applicationId, byte[] identity, byte[]? transcript, CancellationToken ct)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(DocumentPath(applicationId, "identity"))!);
        await File.WriteAllBytesAsync(DocumentPath(applicationId, "identity"), identity, ct);
        if (transcript is not null) await File.WriteAllBytesAsync(DocumentPath(applicationId, "transcript"), transcript, ct);
    }

    public void RemoveUncommitted(Guid applicationId)
    {
        foreach (var kind in new[] { "identity", "transcript" }) File.Delete(DocumentPath(applicationId, kind));
        var directory = Path.GetDirectoryName(DocumentPath(applicationId, "identity"))!;
        if (Directory.Exists(directory)) Directory.Delete(directory); // Only this new application's empty directory.
    }
}
