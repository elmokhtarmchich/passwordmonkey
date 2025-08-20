# News Article Template - PasswordMonkey

This directory contains the reusable template and guidelines for creating new news articles on the PasswordMonkey website.

## 📋 Template Requirements

Every new article must follow the same structure automatically. The template includes:

### 1. HTML5 Boilerplate
- `<!DOCTYPE html>`
- `<html lang="en">`
- Proper `<head>` and `<body>` sections

### 2. Site Consistency
- Uses existing CSS and header/footer components
- Maintains consistent styling with the main site
- Responsive design with Tailwind CSS

### 3. SEO Requirements
- **Title Tag**: `[Article Title] | Password Monkey`
- **Meta Description**: SEO-friendly summary (150-160 characters)
- **Meta Date**: Publish date in `YYYY-MM-DD` format
- **Structured Data**: JSON-LD `NewsArticle` schema

### 4. Content Structure
- `<header>` and `<footer>` identical to main site
- Article content wrapped in `<main><article>...</article></main>`
- Breadcrumb navigation
- Related articles section

## 🚀 How to Create a New Article

### Step 1: Copy the Template
```bash
cp article-template.html YYYY-MM-DD-article-title.html
```

### Step 2: Replace Placeholders
Replace all placeholder text with your actual content:

| Placeholder | What to Replace With |
|-------------|----------------------|
| `[Article Title]` | Your article's headline |
| `[Publish Date]` | Date in YYYY-MM-DD format |
| `[Meta Description]` | SEO description (150-160 chars) |
| `[Full Article Content]` | Your complete article content |
| `[Source / Reference if applicable]` | Source attribution if needed |
| `[filename]` | The actual filename (without .html) |

### Step 3: Update Structured Data
In the JSON-LD script, update:
- `headline`
- `description` 
- `datePublished`
- `dateModified`
- `mainEntityOfPage.@id`

### Step 4: Update Open Graph Tags
Update the Open Graph URL to match your filename:
```html
<meta property="og:url" content="https://passwordmonkey.org/news/your-filename.html">
```

## 📝 Content Guidelines

### Article Structure
1. **Compelling Headline** - Clear, descriptive, SEO-friendly
2. **Meta Description** - Summarize the key points in 150-160 characters
3. **Introduction** - Hook readers with the main story
4. **Body Content** - Well-structured paragraphs with subheadings
5. **Conclusion** - Summary and call-to-action if appropriate
6. **Source Attribution** - Credit original sources when applicable

### Writing Style
- Use clear, concise language
- Include relevant keywords naturally
- Break up text with subheadings
- Use bullet points for lists
- Include internal links to related content
- Optimize for both users and search engines

## 🔧 Technical Details

### File Naming Convention
- Format: `YYYY-MM-DD-descriptive-title.html`
- Example: `2025-01-15-password-manager-comparison.html`
- Use hyphens, not spaces or underscores
- Keep titles descriptive but concise

### Required Meta Tags
```html
<meta name="description" content="Your SEO description here">
<meta name="date" content="2025-01-15">
<meta name="author" content="PasswordMonkey">
```

### Structured Data Schema
The template includes a complete `NewsArticle` schema with:
- Article metadata (title, description, dates)
- Author and publisher information
- Image and section details
- Proper JSON-LD formatting

## 📱 Responsive Design

The template is fully responsive and includes:
- Mobile-first design approach
- Touch-friendly navigation
- Optimized typography for all screen sizes
- Dark mode support
- Accessible color contrasts

## 🎨 Styling

### Tailwind CSS Classes
- Consistent with main site design
- Blue color scheme (`blue-600`, `blue-700`)
- Gray scale for text and backgrounds
- Responsive grid layouts
- Hover effects and transitions

### Typography
- Open Sans font family
- Proper heading hierarchy (h1, h2, h3)
- Readable line heights and spacing
- Optimized for web reading

## 🔍 SEO Best Practices

### On-Page Optimization
- Unique, descriptive titles
- Meta descriptions that encourage clicks
- Proper heading structure (H1, H2, H3)
- Internal linking strategy
- Image alt text when applicable

### Technical SEO
- Valid HTML5 markup
- Structured data implementation
- Open Graph and Twitter Card support
- Canonical URLs
- Proper meta robots tags

## 📊 Analytics & Tracking

### Google Analytics
- Template includes Google AdSense integration
- Compatible with Google Analytics 4
- Event tracking ready for engagement metrics

### Social Media
- Open Graph tags for Facebook/LinkedIn
- Twitter Card support
- Social sharing buttons included

## 🚨 Important Notes

1. **Never delete the template file** - it's your master copy
2. **Always test new articles** in a browser before publishing
3. **Validate HTML** using W3C validator
4. **Check mobile responsiveness** on various devices
5. **Update the news index** when adding new articles
6. **Maintain consistent branding** across all articles

## 📞 Support

If you need help with the template or have questions about creating articles:
1. Check this README first
2. Review existing articles for examples
3. Validate your HTML before publishing
4. Test on multiple devices and browsers

---

**Template Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: PasswordMonkey Team 