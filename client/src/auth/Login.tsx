import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import env from "../env";
import { useScheduleStore } from "../home/schedule-store";
import { useAuthStore } from "./auth-store";
import { loginSchema } from "./authSchemas";
import { saveToken } from "./jwt";

interface LoginData {
  username: string;
  password: string;
}

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<null | string>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const focusOnPasswordField = () => {
    setTimeout(() => {
      if (!passwordRef.current) return;
      passwordRef.current.focus();
      const inputLength = passwordRef.current.value.length;
      passwordRef.current.setSelectionRange(inputLength, inputLength);
    }, 0);
  };

  const onSubmit: SubmitHandler<LoginData> = async data => {
    try {
      const response = await fetch(`${env.serverUrl}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = loginSchema.safeParse(await response.json());
      if (!responseData.success || "errorMessage" in responseData.data) {
        setServerError(
          responseData.success && "errorMessage" in responseData.data
            ? responseData.data.errorMessage
            : "Something went wrong!"
        );
        return;
      }

      const { loggedIn, token, username, courses } = responseData.data;
      saveToken(token);
      useAuthStore.setState({ loggedIn, username, token });
      useScheduleStore.setState({ courses });
      navigate("/");
    } catch (e) {
      setServerError("Something went wrong! Try again later.");
      console.log(e);
    }
  };

  return (
    <VStack
      m="auto"
      w={{ base: "90%", sm: "400px" }}
      h="100vh"
      justify="center"
      gap="1rem"
    >
      <Heading>Login</Heading>
      <Text color="red.200">{serverError}</Text>
      <FormControl isInvalid={!!errors.username}>
        <FormLabel>Username</FormLabel>
        <Input
          autoComplete="false"
          autoCorrect="false"
          {...register("username", {
            minLength: { value: 6, message: "Username too short" },
            required: "Username required",
          })}
        />
        <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
      </FormControl>

      <Controller
        control={control}
        name="password"
        rules={{
          minLength: { value: 6, message: "Password too short!" },
          required: "Password required",
        }}
        render={({ field }) => (
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="false"
                {...field}
                ref={passwordRef}
                pr="4rem"
              />
              <InputRightElement width="4rem" h="100%">
                <Button
                  onClick={() => {
                    toggleShowPassword();
                    focusOnPasswordField();
                  }}
                  borderLeftRadius="0"
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
        )}
      />

      <Box>
        <ButtonGroup mt="5" isDisabled={isSubmitting}>
          <Button onClick={() => void navigate("/signup")}>Sign Up</Button>
          <Button
            colorScheme="blue"
            type="submit"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Login
          </Button>
        </ButtonGroup>
      </Box>
    </VStack>
  );
}

export default Login;
