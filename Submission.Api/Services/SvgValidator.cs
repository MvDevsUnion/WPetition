using System.Xml;

namespace Submission.Api.Services
{
    public static class SvgValidator
    {
        // Tunable limits
        private const int MaxLength = 100_000; // max characters in SVG string
        private const int MaxElements = 5_000; // max number of XML elements

        // Whitelist of allowed element local names (lowercase)
        private static readonly HashSet<string> AllowedElements = new(StringComparer.OrdinalIgnoreCase)
        {
            "svg","g","path","rect","circle","ellipse","line","polyline","polygon",
            "text","tspan","defs","use","title","desc","clipPath","mask",
            "linearGradient","radialGradient","stop","style","metadata"
        };

        // Basic attribute whitelist (prefix-free) - attributes not listed are still allowed but checked for danger.
        private static readonly HashSet<string> AllowedAttributes = new(StringComparer.OrdinalIgnoreCase)
        {
            "id","class","width","height","viewBox","fill","stroke","d","x","y","cx","cy","r","rx","ry","points","stroke-linecap","stroke-linejoin",
            "transform","style","xmlns","xmlns:xlink","xlink:href","href","opacity","stroke-width","font-size","font-family"
        };

        public static bool TryValidate(string svgContent, out string error)
        {
            error = string.Empty;

            if (string.IsNullOrWhiteSpace(svgContent))
            {
                error = "SVG content is empty";
                return false;
            }

            if (svgContent.Length > MaxLength)
            {
                error = $"SVG is too large (>{MaxLength} characters)";
                return false;
            }

            var trimmed = svgContent.TrimStart();
            if (!(trimmed.StartsWith("<svg", StringComparison.OrdinalIgnoreCase) || trimmed.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase)))
            {
                error = "SVG must begin with <svg> or XML prolog";
                return false;
            }

            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit,
                XmlResolver = null,
                MaxCharactersFromEntities = 1024
            };

            int elementCount = 0;

            try
            {
                using var sr = new StringReader(svgContent);
                using var reader = XmlReader.Create(sr, settings);

                while (reader.Read())
                {
                    if (reader.NodeType == XmlNodeType.Element)
                    {
                        elementCount++;
                        if (elementCount > MaxElements)
                        {
                            error = "SVG contains too many elements";
                            return false;
                        }

                        var localName = reader.LocalName ?? string.Empty;

                        // Disallow dangerous elements
                        if (string.Equals(localName, "script", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(localName, "foreignObject", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(localName, "iframe", StringComparison.OrdinalIgnoreCase))
                        {
                            error = $"Disallowed element: {localName}";
                            return false;
                        }

                        //
                        //if (!AllowedElements.Contains(localName))
                        //{
                        //    // allow unknown names in metadata/style namespaces if needed, otherwise reject
                        //    // Here we reject unknown element names to be stricter
                        //    error = $"Disallowed or unknown SVG element: {localName}";
                        //    return false;
                        //}
                        //

                        if (reader.HasAttributes)
                        {
                            while (reader.MoveToNextAttribute())
                            {
                                var attrName = reader.Name ?? string.Empty;
                                var attrValue = reader.Value ?? string.Empty;

                                // Disallow event handler attributes like onclick, onload, etc.
                                if (attrName.StartsWith("on", StringComparison.OrdinalIgnoreCase))
                                {
                                    error = $"Disallowed attribute: {attrName}";
                                    return false;
                                }

                                // Disallow javascript: URIs
                                if (attrValue.IndexOf("javascript:", StringComparison.OrdinalIgnoreCase) >= 0)
                                {
                                    error = $"Disallowed URI scheme in attribute {attrName}";
                                    return false;
                                }

                                // Disallow external http/https references in href attributes
                                if (attrName.EndsWith("href", StringComparison.OrdinalIgnoreCase) ||
                                    attrName.Equals("src", StringComparison.OrdinalIgnoreCase))
                                {
                                    var trimmedVal = attrValue.Trim();
                                    if (trimmedVal.StartsWith("http:", StringComparison.OrdinalIgnoreCase) ||
                                        trimmedVal.StartsWith("https:", StringComparison.OrdinalIgnoreCase))
                                    {
                                        error = $"External references are not allowed ({attrName})";
                                        return false;
                                    }

                                    // If data URIs are allowed for images, you could validate a whitelist like data:image/png;base64,...
                                    // For stricter policy, block all data: URIs:
                                    if (trimmedVal.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                                    {
                                        // reject data URIs to be conservative
                                        error = $"Embedded data URIs are not allowed ({attrName})";
                                        return false;
                                    }
                                }

                                // Optional: allow only known attributes; reject others to be stricter
                                if (!AllowedAttributes.Contains(attrName))
                                {
                                    // allow style attribute; already in whitelist. If attribute is namespaced (e.g., xml:space), allow commonly used ones:
                                    if (!attrName.Contains(":")) // very basic rule
                                    {
                                        error = $"Disallowed or unknown attribute: {attrName}";
                                        return false;
                                    }
                                }
                            }
                            // move back to element
                            reader.MoveToElement();
                        }
                    }
                }
            }
            catch (XmlException xe)
            {
                error = $"Malformed XML: {xe.Message}";
                return false;
            }
            catch (Exception ex)
            {
                error = $"SVG validation failed: {ex.Message}";
                return false;
            }

            return true;
        }
    }
}