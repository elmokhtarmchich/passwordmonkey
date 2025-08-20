# 🚀 PasswordMonkey News Automation System

This directory contains a complete automated news management system that automatically detects and displays news articles on your website. The system is designed to work with GitHub Pages and is ready for n8n automation workflows.

## 🎯 **System Overview**

The automation system consists of three main components:

1. **`news-aggregator.js`** - Frontend JavaScript that displays articles
2. **`news-manifest.json`** - Central database of all articles
3. **`update-manifest.js`** - Node.js script that updates the manifest automatically

## 🔧 **How It Works**

### **Automatic Article Discovery**
- The system scans the `/news` directory for HTML files
- Extracts metadata (title, date, description) from each article
- Updates the central manifest file automatically
- Frontend displays articles from the manifest

### **No Manual Updates Required**
- Add new `.html` files to `/news/`
- Run the manifest updater script
- Articles automatically appear on the website
- Perfect for automation workflows

## 📋 **Requirements**

- **Node.js** 16.0.0 or higher
- **GitHub Pages** hosting
- **n8n** (optional, for automation)

## 🚀 **Quick Setup**

### **Step 1: Install Dependencies**
```bash
cd news/
npm install
```

### **Step 2: Test the System**
```bash
# Update manifest with current articles
npm run update

# Check help
npm run update:help
```

### **Step 3: Verify Frontend**
- Open `/news/index.html` in your browser
- Articles should display automatically
- Check browser console for any errors

## 🔄 **Automation with n8n**

### **Workflow Setup**

1. **Create a new n8n workflow**
2. **Add a "Cron" trigger** (e.g., every hour)
3. **Add an "Execute Command" node** with:
   ```bash
   cd /path/to/your/repo/news && node update-manifest.js
   ```
4. **Add a "Git" node** to commit and push changes
5. **Add error handling** for failed updates

### **n8n Node Configuration**

#### **Execute Command Node**
```json
{
  "command": "node",
  "arguments": "update-manifest.js",
  "cwd": "/path/to/your/repo/news",
  "options": {
    "timeout": 30000
  }
}
```

#### **Git Operations Node**
```json
{
  "operation": "commit",
  "message": "Auto-update news manifest",
  "files": ["news/news-manifest.json"],
  "push": true
}
```

### **Automation Triggers**

- **Scheduled**: Run every hour/day
- **Webhook**: Trigger when new articles are added
- **File Watch**: Monitor directory for changes
- **Manual**: Run on-demand

## 📁 **File Structure**

```
/news/
├── index.html                 # Main news page (automated)
├── news-aggregator.js        # Frontend JavaScript
├── news-manifest.json        # Article database (auto-generated)
├── update-manifest.js        # Node.js updater script
├── package.json              # Node.js dependencies
├── article-template.html     # Article template
├── [article-files].html     # Individual news articles
└── AUTOMATION-README.md     # This file
```

## 🎨 **Customization Options**

### **Modify Article Display**
Edit `news-aggregator.js` to change:
- Articles per page
- Card layout and styling
- Search functionality
- Pagination behavior

### **Change Metadata Extraction**
Edit `update-manifest.js` to modify:
- Title extraction logic
- Date parsing
- Category determination
- Excerpt generation

### **Update Styling**
Modify `index.html` to change:
- Page layout
- Color scheme
- Typography
- Responsive behavior

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Articles Not Displaying**
1. Check browser console for JavaScript errors
2. Verify `news-manifest.json` exists and is valid JSON
3. Ensure `news-aggregator.js` is loaded correctly
4. Check file paths and permissions

#### **Manifest Update Fails**
1. Verify Node.js version (16.0.0+)
2. Check if `jsdom` dependency is installed
3. Ensure write permissions to news directory
4. Review error logs in console output

#### **Metadata Extraction Issues**
1. Verify HTML files have proper meta tags
2. Check for malformed HTML
3. Ensure required fields are present
4. Review extraction logic in updater script

### **Debug Mode**
Enable verbose logging by modifying `update-manifest.js`:
```javascript
// Add this line for detailed logging
console.log('Debug: Processing file:', filename);
```

## 📊 **Performance Optimization**

### **Frontend Optimizations**
- Articles are loaded asynchronously
- Pagination reduces DOM size
- Search filtering is client-side
- Responsive design for all devices

### **Backend Optimizations**
- Manifest updates are incremental
- Only changed files are reprocessed
- Efficient HTML parsing with JSDOM
- Minimal file I/O operations

## 🔒 **Security Considerations**

### **Input Validation**
- HTML content is sanitized before display
- File paths are validated
- Metadata is escaped to prevent XSS
- No eval() or dangerous code execution

### **Access Control**
- Manifest file is publicly readable
- No sensitive data in articles
- Scripts run in browser sandbox
- GitHub Pages security applies

## 🚀 **Deployment**

### **GitHub Pages**
1. Commit all files to your repository
2. Push to main branch
3. GitHub Pages automatically deploys
4. Manifest updates via automation

### **Other Hosting**
1. Upload files to web server
2. Ensure Node.js is available for updates
3. Configure automation to run on server
4. Set up webhook triggers if needed

## 📈 **Monitoring & Analytics**

### **Success Metrics**
- Articles display correctly
- Manifest updates complete successfully
- Automation runs without errors
- Page load times remain fast

### **Error Tracking**
- Console errors are logged
- Manifest update failures are reported
- Automation workflow status
- File processing statistics

## 🔮 **Future Enhancements**

### **Planned Features**
- RSS feed generation
- Email newsletter integration
- Social media sharing
- Article analytics
- Category filtering
- Advanced search

### **Integration Possibilities**
- CMS integration (WordPress, Ghost)
- Social media automation
- Email marketing platforms
- Analytics services
- CDN optimization

## 📞 **Support & Maintenance**

### **Regular Tasks**
- Monitor automation workflows
- Review error logs
- Update dependencies
- Backup manifest files
- Test new features

### **Getting Help**
1. Check this documentation
2. Review error logs
3. Test with sample articles
4. Check GitHub issues
5. Contact development team

---

## 🎉 **Success!**

Your automated news system is now ready! Here's what you've accomplished:

✅ **Automatic article discovery**  
✅ **No manual updates required**  
✅ **SEO-optimized display**  
✅ **Responsive design**  
✅ **n8n automation ready**  
✅ **GitHub Pages compatible**  

The system will automatically detect new articles and display them on your website. Just add HTML files to `/news/` and run the updater script (or let n8n do it automatically)!

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained By**: PasswordMonkey Team 