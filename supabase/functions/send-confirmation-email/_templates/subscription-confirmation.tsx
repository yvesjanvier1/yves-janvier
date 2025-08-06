import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Img,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SubscriptionConfirmationEmailProps {
  email: string
  confirmationUrl: string
  unsubscribeUrl: string
}

export const SubscriptionConfirmationEmail = ({
  email,
  confirmationUrl,
  unsubscribeUrl,
}: SubscriptionConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>👋 Thanks for subscribing! Click below to confirm your newsletter subscription.</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with gradient background */}
        <Section style={header}>
          <Heading style={headerTitle}>
            📧 Confirm Your Subscription
          </Heading>
          <Text style={headerSubtitle}>
            You're almost there!
          </Text>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={welcomeTitle}>Welcome aboard! 🎉</Heading>
          
          <Text style={paragraph}>
            Hi there! 👋
          </Text>
          
          <Text style={paragraph}>
            Thank you for subscribing to our newsletter! We're excited to have you join our community. 
            You'll receive updates about:
          </Text>
          
          <Section style={featureList}>
            <Text style={featureItem}>🚀 New project launches and case studies</Text>
            <Text style={featureItem}>📝 Fresh blog posts and insights</Text>
            <Text style={featureItem}>💡 Tips and tutorials</Text>
            <Text style={featureItem}>🎯 Exclusive content and early access</Text>
          </Section>
          
          <Text style={paragraph}>
            To start receiving these updates, please confirm your subscription by clicking the button below:
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={confirmationUrl}
            >
              ✅ Confirm My Subscription
            </Button>
          </Section>

          <Text style={smallText}>
            Or copy and paste this link in your browser:
          </Text>
          <Text style={linkText}>
            <Link href={confirmationUrl} style={link}>
              {confirmationUrl}
            </Link>
          </Text>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            If you didn't subscribe to our newsletter, you can safely ignore this email.
            No further emails will be sent to you.
          </Text>
          
          <Text style={footerText}>
            Need help? Just reply to this email and we'll get back to you.
          </Text>
          
          <Text style={footerLinks}>
            <Link href={unsubscribeUrl} style={footerLink}>
              Unsubscribe
            </Link>
            {' • '}
            <Link href="#" style={footerLink}>
              Privacy Policy
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SubscriptionConfirmationEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  background: 'linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%)',
  borderRadius: '12px 12px 0 0',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
}

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  margin: '0',
  fontWeight: 'normal',
}

const content = {
  padding: '40px 30px',
}

const welcomeTitle = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#555555',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const featureList = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const featureItem = {
  color: '#555555',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#6C4DFF',
  background: 'linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%)',
  borderRadius: '50px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  lineHeight: '1',
  boxShadow: '0 4px 20px rgba(108, 77, 255, 0.3)',
  border: 'none',
}

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '24px 0 8px 0',
  textAlign: 'center' as const,
}

const linkText = {
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
}

const link = {
  color: '#6C4DFF',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const divider = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
}

const footer = {
  padding: '0 30px',
}

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
}

const footerLinks = {
  textAlign: 'center' as const,
  margin: '24px 0 0 0',
}

const footerLink = {
  color: '#999999',
  fontSize: '12px',
  textDecoration: 'underline',
}