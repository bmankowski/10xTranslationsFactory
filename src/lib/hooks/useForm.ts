import * as React from "../react-compat";

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
}

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

export interface FormConfig<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export function useForm<T extends Record<string, unknown>>(config: FormConfig<T>) {
  const { initialValues, onSubmit, validate } = config;

  // Initialize form state
  const [formState, setFormState] = React.useState<FormState<T>>(() => {
    const initialState: Partial<FormState<T>> = {};

    for (const key in initialValues) {
      initialState[key] = {
        value: initialValues[key],
        touched: false,
        error: undefined,
      };
    }

    return initialState as FormState<T>;
  });

  // Track loading state
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Track form error
  const [formError, setFormError] = React.useState<string | null>(null);

  // Handle field change
  const handleChange = React.useCallback((name: keyof T, value: T[keyof T]) => {
    setFormState((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        touched: true,
      },
    }));
  }, []);

  // Handle field blur
  const handleBlur = React.useCallback((name: keyof T) => {
    setFormState((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
      },
    }));
  }, []);

  // Validate form
  const validateForm = React.useCallback(() => {
    if (!validate) return true;

    const errors = validate(getValues());
    let isValid = true;

    const newState = { ...formState };

    for (const key in newState) {
      const fieldKey = key as keyof T;
      newState[fieldKey] = {
        ...newState[fieldKey],
        error: errors[fieldKey],
      };

      if (errors[fieldKey]) {
        isValid = false;
      }
    }

    setFormState(newState);
    return isValid;
  }, [formState, validate, getValues]);

  // Get current form values
  const getValues = React.useCallback(() => {
    const values: Partial<T> = {};

    for (const key in formState) {
      values[key] = formState[key].value;
    }

    return values as T;
  }, [formState]);

  // Handle form submission
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const isValid = validateForm();
      if (!isValid) return;

      setIsSubmitting(true);
      setFormError(null);

      try {
        await onSubmit(getValues());
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, getValues]
  );

  // Reset form
  const reset = React.useCallback(
    (newValues?: Partial<T>) => {
      const resetValues = newValues || initialValues;

      const resetState: Partial<FormState<T>> = {};

      for (const key in resetValues) {
        resetState[key] = {
          value: resetValues[key],
          touched: false,
          error: undefined,
        };
      }

      setFormState((prev) => ({
        ...prev,
        ...resetState,
      }));

      setFormError(null);
    },
    [initialValues]
  );

  return {
    formState,
    isSubmitting,
    formError,
    handleChange,
    handleBlur,
    handleSubmit,
    getValues,
    reset,
    validateForm,
  };
}
