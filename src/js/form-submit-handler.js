// Custom Form Submit Handler - Dual Submission
// Sends to Web3forms first, then to Make.com for tracking

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action*="make.com"]');
  
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect all form data
    const formData = new FormData(form);
    
    // Build JSON payload for Web3forms (clean, essential fields only)
    const web3Payload = {
      access_key: formData.get('access_key') || '',
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      gewenste_datum: formData.get('gewenste_datum') || '',
      bericht: formData.get('bericht') || '',
      lichaamsdeel: formData.get('lichaamsdeel') || '',
      grootte: formData.get('grootte') || ''
    };
    
    // Build JSON payload for Make.com (with UTM tracking)
    const makePayload = {
      // Form fields
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      gewenste_datum: formData.get('gewenste_datum') || '',
      bericht: formData.get('bericht') || '',
      lichaamsdeel: formData.get('lichaamsdeel') || '',
      grootte: formData.get('grootte') || '',
      
      // UTM & Google Ads parameters
      utm_source: formData.get('utm_source') || '',
      utm_medium: formData.get('utm_medium') || '',
      utm_campaign: formData.get('utm_campaign') || '',
      utm_id: formData.get('utm_id') || '',
      utm_term: formData.get('utm_term') || '',
      utm_content: formData.get('utm_content') || '',
      device: formData.get('device') || '',
      matchtype: formData.get('matchtype') || '',
      network: formData.get('network') || '',
      gclid: formData.get('gclid') || '',
      
      // Meta data
      page_url: window.location.href,
      ingediend_op: new Date().toISOString(),
      onderwerp: 'Nieuwe tattoo boeking via website'
    };

    const makeWebhookUrl = form.getAttribute('action');
    const web3formsUrl = 'https://api.web3forms.com/submit';
    const redirectUrl = formData.get('redirect') || '../bedankt';

    try {
      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Versturen...';

      // Step 1: Send to Web3forms (primary submission for email)
      const web3Response = await fetch(web3formsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(web3Payload)
      });

      if (!web3Response.ok) {
        throw new Error(`Web3forms failed: HTTP ${web3Response.status}`);
      }

      // Step 2: Send to Make.com webhook (for tracking/analytics)
      try {
        await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(makePayload)
        });
        // Make.com is secondary, don't block on failure
      } catch (makeError) {
        console.warn('Make.com submission failed (non-critical):', makeError);
      }

      // Success - redirect to thank you page
      window.location.href = redirectUrl;

    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Er ging iets mis bij het versturen. Probeer het opnieuw of neem contact op via WhatsApp.');
      
      // Re-enable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});
