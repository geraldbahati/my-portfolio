import { contactSchema } from '@/lib/validators/contactSchema';

describe('Contact Form Validation', () => {
  describe('valid data', () => {
    it('should pass validation with correct data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'This is a test message that is long enough.',
        privacyConsent: true,
        _honeypot: '',
      };

      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('name validation', () => {
    it('should reject names that are too short', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
        message: 'Valid message here',
        privacyConsent: true,
        _honeypot: '',
      };

      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
      }
    });

    it('should reject names that are too long', () => {
      const data = {
        name: 'J'.repeat(101),
        email: 'john@example.com',
        message: 'Valid message here',
        privacyConsent: true,
        _honeypot: '',
      };

      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be less than 100 characters');
      }
    });
  });

  describe('email validation', () => {
    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@domain.com',
        'user@',
        'user..double.dot@domain.com',
      ];

      invalidEmails.forEach((email) => {
        const data = {
          name: 'John Doe',
          email,
          message: 'Valid message here',
          privacyConsent: true,
          _honeypot: '',
        };

        const result = contactSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid email address');
        }
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+label@domain.org',
      ];

      validEmails.forEach((email) => {
        const data = {
          name: 'John Doe',
          email,
          message: 'Valid message here',
          privacyConsent: true,
          _honeypot: '',
        };

        const result = contactSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('message validation', () => {
    it('should reject messages that are too short', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short',
        privacyConsent: true,
        _honeypot: '',
      };

      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Message must be at least 10 characters');
      }
    });

    it('should reject messages that are too long', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'a'.repeat(1001),
        privacyConsent: true,
        _honeypot: '',
      };

      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Message must be less than 1000 characters');
      }
    });
  });

  describe('privacy consent validation', () => {
    it('should reject when privacy consent is false', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Valid message here',
        privacyConsent: false,
        _honeypot: '',
      };

      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('You must agree to the privacy policy');
      }
    });
  });

  describe('honeypot validation', () => {
    it('should accept empty honeypot field', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Valid message here',
        privacyConsent: true,
        _honeypot: '',
      };

      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept undefined honeypot field', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Valid message here',
        privacyConsent: true,
      };

      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});