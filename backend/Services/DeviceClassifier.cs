namespace CareerAdvisor.Api.Services;

/// <summary>
/// Reduces a User-Agent header to a device class and OS family, and nothing else.
///
/// The department's question is "what are learners reaching us on?", because the
/// answer decides whether effort goes into the PWA, a lighter build, or USSD and
/// SMS reach for feature phones. That question is answered by "mobile / Android".
/// It is not answered by a full UA string, which is a fingerprinting vector and
/// more personal information than the question needs — so the raw header is
/// classified here and discarded, never stored.
/// </summary>
public static class DeviceClassifier
{
    public record DeviceInfo(string DeviceType, string Platform);

    public static DeviceInfo Classify(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent)) return new("unknown", "unknown");
        var ua = userAgent.ToLowerInvariant();

        // Tablets first: an Android tablet's UA also contains "android", and
        // iPad is the single most misclassified device in analytics anywhere.
        var deviceType =
            ua.Contains("ipad") || (ua.Contains("android") && !ua.Contains("mobile")) || ua.Contains("tablet")
                ? "tablet"
            : ua.Contains("mobi") || ua.Contains("iphone") || ua.Contains("ipod") || ua.Contains("android")
                ? "mobile"
            : ua.Contains("windows") || ua.Contains("macintosh") || ua.Contains("x11") || ua.Contains("linux")
                ? "desktop"
                : "unknown";

        var platform =
            ua.Contains("android") ? "Android"
            : ua.Contains("iphone") || ua.Contains("ipad") || ua.Contains("ipod") ? "iOS"
            : ua.Contains("windows") ? "Windows"
            : ua.Contains("mac os x") || ua.Contains("macintosh") ? "macOS"
            : ua.Contains("linux") || ua.Contains("x11") ? "Linux"
            : "unknown";

        return new(deviceType, platform);
    }
}
