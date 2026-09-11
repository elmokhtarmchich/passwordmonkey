# WebMCP Tools

PasswordMonkey implements WebMCP (Web Model Context Protocol) for AI agent interaction. The following tools are registered and available for use by AI agents.

## Available Tools

### generate_password

Generate a cryptographically secure random password with customizable options.

**Parameters:**
- `length` (integer, 4-50): Password length in characters (default: 16)
- `includeUppercase` (boolean): Include uppercase letters A-Z (default: true)
- `includeLowercase` (boolean): Include lowercase letters a-z (default: true)
- `includeNumbers` (boolean): Include numbers 0-9 (default: true)
- `includeSymbols` (boolean): Include special symbols !@#$%^&* (default: true)
- `excludeAmbiguous` (boolean): Exclude ambiguous characters (default: false)
- `excludeSimilar` (boolean): Exclude similar-looking characters (default: false)

**Returns:** JSON object containing:
- `password`: The generated password string
- `strength`: Password strength score (entropy in bits)
- `length`: Length of the generated password
- `options`: Configuration used for generation

**Annotations:**
- `readOnlyHint`: false
- `consequentialHint`: false

**Example usage:**
```javascript
// Generate a 16-character password with all character types
const result = await document.modelContext.executeTool(
  { name: 'generate_password' },
  JSON.stringify({ length: 16 })
);
```

### copy_password

Copy the currently generated password to the clipboard.

**Parameters:** None

**Returns:** JSON object containing:
- `success`: Boolean indicating if copy was successful
- `message`: Status message

**Annotations:**
- `readOnlyHint`: false
- `untrustedContentHint`: true

**Note:** This tool handles potentially sensitive data. Agents should exercise appropriate caution with the output.

**Example usage:**
```javascript
const result = await document.modelContext.executeTool(
  { name: 'copy_password' },
  '{}'
);
```

### get_password_strength

Get the strength analysis of a password including entropy calculation and security recommendations.

**Parameters:**
- `password` (string, required): The password to analyze

**Returns:** JSON object containing:
- `password`: The analyzed password
- `entropy`: Entropy score in bits
- `strength`: Strength rating (Weak, Fair, Good, Strong)
- `length`: Password length
- `recommendations`: Array of security improvement suggestions

**Annotations:**
- `readOnlyHint`: true

**Example usage:**
```javascript
const result = await document.modelContext.executeTool(
  { name: 'get_password_strength' },
  JSON.stringify({ password: 'myPassword123!' })
);
```

### generate_qr_code

Generate a QR code for the current password to facilitate mobile sharing and scanning.

**Parameters:**
- `password` (string, required): The password to encode in the QR code

**Returns:** JSON object containing:
- `success`: Boolean indicating if generation was successful
- `qrDataURL`: Data URL of the generated QR code image
- `message`: Status message

**Annotations:**
- `readOnlyHint`: false
- `untrustedContentHint`: true

**Note:** QR codes contain password data and should be shared securely.

**Example usage:**
```javascript
const result = await document.modelContext.executeTool(
  { name: 'generate_qr_code' },
  JSON.stringify({ password: 'SecurePass123!' })
);
```

### validate_password_options

Validate password generation options to ensure they will produce a strong, usable password.

**Parameters:**
- `length` (integer, required): Password length to validate
- `options` (object): Character type options
  - `uppercase` (boolean)
  - `lowercase` (boolean)
  - `numbers` (boolean)
  - `symbols` (boolean)

**Returns:** JSON object containing:
- `valid`: Boolean indicating if options are valid
- `warnings`: Array of warning messages
- `recommendations`: Array of improvement suggestions
- `assessedAt`: ISO timestamp of assessment

**Annotations:**
- `readOnlyHint`: true

**Example usage:**
```javascript
const result = await document.modelContext.executeTool(
  { name: 'validate_password_options' },
  JSON.stringify({ 
    length: 8,
    options: { uppercase: true, lowercase: true }
  })
);
```

## Tool Discovery

To discover available tools, use the standard WebMCP API:

```javascript
const tools = await document.modelContext.getTools();
console.log(tools.map(t => t.name));
```

## Security Considerations

- Tools marked with `untrustedContentHint: true` handle potentially sensitive data
- The `copy_password` and `generate_qr_code` tools should be used with appropriate security awareness
- All password generation is client-side and never transmitted to servers
- Read-only tools (`readOnlyHint: true`) can be safely called without side effects

## Browser Requirements

WebMCP support requires:
- Chrome 150 or later
- WebMCP origin trial enabled
- `chrome://flags/#enable-webmcp-testing` for local development

## Documentation

- [WebMCP Overview](https://developer.chrome.com/docs/ai/webmcp)
- [Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Best Practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)