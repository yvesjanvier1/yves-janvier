
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { contactFormSchema, checkRateLimit, sanitizeError } from "@/lib/security";
import { z } from "zod";

const ContactPage = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    try {
      contactFormSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive"
      });
      return;
    }
    
    // Rate limiting check
    const clientId = `${formData.email}_${Date.now().toString().slice(0, -3)}0000`; // 5-minute window
    if (!checkRateLimit(clientId, 3, 300000)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait a few minutes before submitting another message",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          ...formData,
          // Additional security: timestamp for audit
          created_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      
      toast({
        title: t('contact.success.title'),
        description: t('contact.success.description'),
      });
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: t('contact.error.title'),
        description: sanitizeError(error),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <SectionHeader
        title={t('contact.title')}
        subtitle={t('contact.subtitle')}
        centered
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div>
          <h3 className="text-xl font-semibold mb-6">{t('contact.letsConnect')}</h3>
          <p className="text-muted-foreground mb-8">
            {t('contact.description')}
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Email</h4>
                <a 
                  href="mailto:janvieryves44@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  janvieryves44@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-3 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Phone</h4>
                <span className="text-muted-foreground">+1 (509) 3135-6094</span>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Location</h4>
                <span className="text-muted-foreground">Haiti, Delmas</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="font-medium mb-3">{t('footer.socialMedia')}</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/in/janvieryves44/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-input rounded-md hover:border-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/yvesjanvier1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-input rounded-md hover:border-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/yvesjanvier01" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-input rounded-md hover:border-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                {t('contact.form.name')}
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('contact.form.namePlaceholder')}
                className={validationErrors.name ? 'border-destructive' : ''}
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                {t('contact.form.email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t('contact.form.emailPlaceholder')}
                className={validationErrors.email ? 'border-destructive' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">
                {t('contact.form.subject')}
              </label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder={t('contact.form.subjectPlaceholder')}
                className={validationErrors.subject ? 'border-destructive' : ''}
              />
              {validationErrors.subject && (
                <p className="text-sm text-destructive mt-1">{validationErrors.subject}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                {t('contact.form.message')}
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder={t('contact.form.messagePlaceholder')}
                className={`min-h-32 ${validationErrors.message ? 'border-destructive' : ''}`}
              />
              {validationErrors.message && (
                <p className="text-sm text-destructive mt-1">{validationErrors.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
