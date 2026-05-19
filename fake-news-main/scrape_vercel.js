const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    console.log('Navigating to Vercel deployment page...');
    await page.goto('https://vercel.com/vinsmokefly-gmailcoms-projects/fake-news-main', { waitUntil: 'networkidle' });
    
    // Wait for the deployments to load
    await page.waitForSelector('text=Deployment', { timeout: 15000 });
    
    // Look for status indicators or failed builds
    const bodyText = await page.innerText('body');
    const lowerText = bodyText.toLowerCase();
    
    if (lowerText.includes('failed') || lowerText.includes('error')) {
        console.log('Found failure/error text on page.');
    }

    // Try to find the most recent deployment link (usually the first one in a list)
    // Often there's an 'Error' or 'Red' dot or specific text.
    // Let's look for buttons/links that might lead to logs.
    const links = await page.maineval('a', anchors => anchors.map(a => ({href: a.href, text: a.innerText})));
    const buildLink = links.find(l => l.text.toLowerCase().includes('failed') || l.text.toLowerCase().includes('deployment') || l.href.includes('/deployments/'));
    
    if (buildLink) {
        console.log('Navigating to deployment details:', buildLink.href);
        await page.goto(buildLink.href, { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Wait for logs to stream in
        
        const logs = await page.innerText('body');
        console.log('EXTRACTED_LOGS_START');
        console.log(logs.substring(0, 2000));
        console.log('EXTRACTED_LOGS_END');
    } else {
        console.log('Could not find specific build link, dumping page text.');
        console.log('EXTRACTED_LOGS_START');
        console.log(bodyText.substring(0, 2000));
        console.log('EXTRACTED_LOGS_END');
    }

  } catch (err) {
    console.error('Error during scraping:', err);
  } finally {
    await browser.close();
  }
})();
