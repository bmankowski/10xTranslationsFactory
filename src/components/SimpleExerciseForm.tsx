import * as React from '../lib/react-compat';
import { useForm } from '../lib/hooks/useForm';
import { 
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface SimpleFormValues {
  name: string;
  email: string;
}

export default function SimpleExerciseForm() {
  const { toast } = useToast();
  
  const {
    formState,
    isSubmitting,
    formError,
    handleChange,
    handleSubmit
  } = useForm<SimpleFormValues>({
    initialValues: {
      name: '',
      email: ''
    },
    validate: (values) => {
      const errors: Partial<Record<keyof SimpleFormValues, string>> = {};
      
      if (!values.name.trim()) {
        errors.name = 'Name is required';
      }
      
      if (!values.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Form submitted',
        description: `Name: ${values.name}, Email: ${values.email}`,
      });
    }
  });
  
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Simple Exercise Form</h2>
      
      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormItem>
            <FormLabel htmlFor="name">Name</FormLabel>
            <FormControl>
              <Input
                id="name"
                value={formState.name.value}
                onChange={(e) => handleChange('name', e.target.value)}
                aria-invalid={!!formState.name.error}
              />
            </FormControl>
            {formState.name.error && (
              <FormMessage>{formState.name.error}</FormMessage>
            )}
          </FormItem>
          
          <FormItem>
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormControl>
              <Input
                id="email"
                type="email"
                value={formState.email.value}
                onChange={(e) => handleChange('email', e.target.value)}
                aria-invalid={!!formState.email.error}
              />
            </FormControl>
            {formState.email.error && (
              <FormMessage>{formState.email.error}</FormMessage>
            )}
          </FormItem>
          
          {formError && (
            <div className="text-sm font-medium text-destructive">{formError}</div>
          )}
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </Form>
    </div>
  );
} 