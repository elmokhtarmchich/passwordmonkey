# Get yesterday's date in YYYY-MM-DD format
$yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")

# Get all HTML files in the news directory from yesterday
$newsDir = Join-Path $PSScriptRoot "..\news"
$files = Get-ChildItem -Path $newsDir -Filter "$yesterday-*.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Extract article text (remove HTML tags)
    $textOnly = $content -replace '<[^>]+>', ' '
    
    # Count words
    $wordCount = ($textOnly -split '\s+').Count
    
    # Calculate reading time (200 words per minute)
    $readingTime = [math]::Ceiling($wordCount / 200)
    
    # Update reading time in the file
    $newContent = $content -replace '(\d+) min read', "$readingTime min read"
    
    # Save the updated content
    $newContent | Set-Content $file.FullName -Force
    
    Write-Host "Updated reading time for $($file.Name) to $readingTime minutes"
}

Write-Host "Done updating reading times"
