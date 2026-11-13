#!/usr/bin/env node

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    // Removed substring(0, 50) - filename limit is well above this
    // Max filename would be: YYYY-MM-DD-slug-6chars.html (approx 70-80 chars)
    // Well within filesystem limits (typically 255 chars)
    .trim();
}

// Test with truncated titles
const testTitles = [
  "CISA Flags SonicWall SonicOS MFA Bypass Flaw Amid Reports of Possible Exploitation",
  "Default 'admin:admin' Server Password Helps Researchers Hack Two Automakers, Unlock and Start Cars",
  "Hackers Exploiting 'SSHole' Authentication Bypass in OpenSSH",
];

console.log("Testing slugify function:\n");

testTitles.forEach(title => {
  const slug = slugify(title);
  console.log(`Title: ${title}`);
  console.log(`Slug:  ${slug}`);
  console.log(`Length: ${slug.length}`);
  console.log(`Truncated? ${slug.length >= 50}`);
  console.log('');
});
