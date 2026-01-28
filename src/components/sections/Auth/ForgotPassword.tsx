import { sendResetPasswordEmail } from "@/actions/auth";
import { Mail } from "@/utils/icons";
import { addToast, Button, Input, Link } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { ForgotPasswordFormSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";

const AuthForgotPasswordForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const { success, message } = await sendResetPasswordEmail(data);

      if (success) {
        setForm("login");
      }

      return addToast({
        title: message,
        color: success ? "success" : "danger",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "An unexpected error occurred",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const getButtonText = useCallback(() => {
    if (isSubmitting) return "Sending Email...";
    return "Send";
  }, [isSubmitting]);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <p className="text-small text-foreground-500 mb-4 text-center">
        You'll receive an email with a link to reset your password
      </p>
      <Input
        {...register("email")}
        isInvalid={!!errors.email?.message}
        errorMessage={errors.email?.message}
        isRequired
        label="Email Address"
        name="email"
        placeholder="Enter your email"
        type="email"
        variant="underlined"
        startContent={<Mail className="text-xl" />}
        isDisabled={isSubmitting}
      />
      <Button
        className="mt-3 w-full"
        color="primary"
        type="submit"
        variant="shadow"
        isLoading={isSubmitting}
      >
        {getButtonText()}
      </Button>
    </form>
  );
};

export default AuthForgotPasswordForm;
