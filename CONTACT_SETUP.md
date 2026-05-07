# Web3Forms Contact Form Setup

The portfolio site now uses a contact form powered by Web3Forms. This replaces the old mailto links and provides a proper form submission experience.

## Activation Steps

1. Visit https://web3forms.com in your browser
2. In the "Get your free Access Key" field, enter: `kdjsplash@gmail.com`
3. Click "Create Access Key"
4. Check your email (kdjsplash@gmail.com) for the access key. It will be a long alphanumeric string.
5. Log into Vercel and navigate to your project settings
6. Go to Settings > Environment Variables
7. Create a new variable:
   - Name: `NEXT_PUBLIC_WEB3FORMS_KEY`
   - Value: (paste the key from the email)
8. Redeploy the site (Vercel will auto-deploy on git push, or manually trigger a deployment)

That is all. The contact form at `/contact` will now be fully functional.

## Alternative. Using Vercel CLI

If you prefer to set the environment variable via the command line:

```bash
cd ~/Downloads/portfolio-hub
vercel env add NEXT_PUBLIC_WEB3FORMS_KEY
# Paste the access key when prompted
vercel deploy --prod
```

## Form Features

The contact form includes:

- Required fields. name, email, message
- Optional field. company
- Honeypot spam protection (hidden botcheck field)
- Loading state on submit button
- Success confirmation message
- Error handling with email fallback
- Mobile responsive design matching the site brand

All submissions are sent directly to kdjsplash@gmail.com via Web3Forms API. No backend server required.
