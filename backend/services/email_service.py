import os
import httpx
import traceback
from utils.config import get_settings

class EmailService:
    def __init__(self):
        try:
            self.settings = get_settings()
        except Exception:
            self.settings = None
            
        self.sendgrid_key = os.environ.get("SENDGRID_API_KEY")
        self.from_email = os.environ.get("FROM_EMAIL", "hello@resume-ai.platform")

    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Sends an email using SendGrid if configured, else prints to console as a mock."""
        if self.sendgrid_key and self.sendgrid_key.startswith("SG."):
            return await self._send_sendgrid(to_email, subject, html_content)
        else:
            return self._send_mock(to_email, subject, html_content)

    async def _send_sendgrid(self, to_email: str, subject: str, html_content: str):
        url = "https://api.sendgrid.com/v3/mail/send"
        headers = {
            "Authorization": f"Bearer {self.sendgrid_key}",
            "Content-Type": "application/json"
        }
        data = {
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": self.from_email},
            "subject": subject,
            "content": [{"type": "text/html", "value": html_content}]
        }
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, headers=headers, json=data)
                if resp.status_code in (200, 202):
                    print(f"📧 ✅ SendGrid email successfully sent to {to_email}")
                    return True
                else:
                    print(f"❌ SendGrid error: {resp.text}")
                    return False
            except Exception as e:
                print(f"❌ SendGrid network error: {e}")
                traceback.print_exc()
                return False

    def _send_mock(self, to_email: str, subject: str, html_content: str):
        print("\n" + "="*60)
        print(f"📧 [MOCK EMAIL SERVICE] -> Mail captured in development mode")
        print(f"To:      {to_email}")
        print(f"From:    {self.from_email}")
        print(f"Subject: {subject}")
        print(f"Payload: (HTML, length: {len(html_content)} bytes)")
        print("="*60 + "\n")
        return True

    # -- High-level Notification Templates --

    async def send_welcome_email(self, to_email: str, name: str):
        subject = "Welcome to Resume AI Platform! 🎉"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2>Hi {name}!</h2>
            <p>Welcome to <strong>Resume AI Platform</strong>. We're thrilled to have you on board.</p>
            <p>Our AI engines (DeepSeek & Groq) are ready to help you optimize your resume, beat the ATS, and land more interviews.</p>
            <br>
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Upload your existing PDF or build one from scratch.</li>
                <li>Run the free ATS analyzer.</li>
                <li>Apply our AI-generated improvement suggestions.</li>
            </ol>
            <br>
            <p>Best regards,<br>The Resume AI Team</p>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html)
        
    async def send_hr_view_notification(self, candidate_email: str, company: str):
        subject = f"Good news: {company} is reviewing your resume!"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h3>Your Resume Just Got Noticed! 👀</h3>
            <p>Hi there,</p>
            <p>An HR recruiter from <strong>{company}</strong> just viewed your profile on the Resume AI Platform.</p>
            <p>This is a great sign! Make sure your contact information is up to date and your skills are fully mapped out.</p>
            <br>
            <p>Fingers crossed,<br>The Resume AI Team</p>
        </body>
        </html>
        """
        return await self.send_email(candidate_email, subject, html)
