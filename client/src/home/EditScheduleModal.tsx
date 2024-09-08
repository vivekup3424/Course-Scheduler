import { AddIcon, ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { useAuthStore } from "../auth/auth-store";
import env from "../env";
import {
  generateEmptyCourse,
  Schedule,
  scheduleSchema,
  useScheduleStore,
} from "./schedule-store";

interface Props {
  isModalOpen: boolean;
  toggleModal: () => void;
}

interface EditScheduleContext {
  methods: UseFormReturn<Schedule>;
  fieldArrayMethods: UseFieldArrayReturn<Schedule, "courses">;
  saveForm: SubmitHandler<Schedule>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  submitForm: (schedule: Schedule) => Promise<void>;
  onClose: () => void;
  toggleModal: () => void;
}

const EditScheduleModalContext = createContext({} as EditScheduleContext);

const EditScheduleModal = ({ isModalOpen, toggleModal }: Props) => {
  const [step, setStep] = useState(0);

  const courses = useScheduleStore(state => state.courses);
  const { token } = useAuthStore();

  const methods = useForm<Schedule>({ defaultValues: { courses } });
  const {
    formState: { isSubmitSuccessful },
    control,
    reset,
  } = methods;

  const fieldArrayMethods = useFieldArray({
    name: "courses",
    control,
  });

  const onClose = () => {
    setStep(0);
    toggleModal();
    reset({ courses });
  };

  const saveForm: SubmitHandler<Schedule> = ({ courses: newCourses }) => {
    const cleanedCourses = newCourses.map(({ letters, number, ...props }) => ({
      letters: letters.trim().toUpperCase().replaceAll(" ", ""),
      number: number.trim().toUpperCase().replaceAll(" ", ""),
      ...props,
    }));
    useScheduleStore.setState({ courses: cleanedCourses });
  };

  const submitForm = async (schedule: Schedule) => {
    const response = await fetch(`${env.serverUrl}/api/schedule`, {
      method: "POST",
      body: JSON.stringify(schedule),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const responseData = await response.json();
    if ("errorMessage" in responseData) {
      throw new Error(responseData.errorMessage);
    }
    const parsedSchedule = scheduleSchema.safeParse(responseData);
    console.log(parsedSchedule);
    if (parsedSchedule.success) {
      saveForm(parsedSchedule.data);
    } else {
      throw new Error("Something went wrong!");
    }
  };

  useEffect(() => {
    reset({ courses });
  }, [courses, reset, isSubmitSuccessful]);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent _dark={{ bg: "bg" }} h="90vh">
        <EditScheduleModalContext.Provider
          value={{
            methods,
            fieldArrayMethods,
            onClose,
            setStep,
            saveForm,
            submitForm,
            toggleModal,
          }}
        >
          {step === 0 ? <CoursesForm /> : <PrerequisitesForm />}
        </EditScheduleModalContext.Provider>
      </ModalContent>
    </Modal>
  );
};

export default EditScheduleModal;

const CoursesForm = () => {
  const {
    fieldArrayMethods: { fields, remove, append },
    methods: {
      handleSubmit,
      register,
      formState: { errors, isSubmitting },
      setError,
    },
    onClose,
    saveForm,
    submitForm,
    setStep,
    toggleModal,
  } = useContext(EditScheduleModalContext);

  return (
    <>
      <ModalHeader fontSize="2xl">Add Courses</ModalHeader>
      <ModalCloseButton size="lg" />
      <ModalBody>
        <>
          <Text color="red.200">{errors?.root?.message}</Text>
          <Grid gap="2rem">
            {fields.length ? (
              fields.map((field, i) => (
                <Box key={field.id}>
                  <HStack justify="space-between" align="end">
                    <Heading size="md" py="2">
                      {field.letters + field.number || "New Course"}
                    </Heading>
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete course"
                      onClick={() => void remove(i)}
                      size="sm"
                    />
                  </HStack>

                  <FormControl
                    isInvalid={
                      !!(errors.courses && errors.courses[i]?.letters?.message)
                    }
                  >
                    <FormLabel>Course Subject Code</FormLabel>
                    <Input
                      {...register(`courses.${i}.letters` as const, {
                        required: "Course Subject Code is required",
                      })}
                    />
                    <FormErrorMessage>
                      {errors.courses && errors.courses[i]?.letters?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={
                      !!(errors.courses && errors.courses[i]?.number?.message)
                    }
                  >
                    <FormLabel>Course Number</FormLabel>
                    <Input
                      {...register(`courses.${i}.number` as const, {
                        required: "Course Number is required",
                      })}
                    />
                    <FormErrorMessage>
                      {errors.courses && errors.courses[i]?.number?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              ))
            ) : (
              <Text textAlign="center">
                Empty schedule. Click 'Add Course' to begin creating a schedule.
              </Text>
            )}
          </Grid>
        </>
      </ModalBody>

      <ModalFooter gap="1">
        <Button
          rightIcon={<AddIcon />}
          onClick={() => {
            append(generateEmptyCourse());
          }}
          mr="auto"
        >
          Add Course
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {fields.length > 1 ? (
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit(data => {
              saveForm(data);
              setStep(1);
            })}
            isDisabled={fields.length === 0}
          >
            Next
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            mr={3}
            isLoading={isSubmitting}
            onClick={handleSubmit(async data => {
              try {
                await submitForm(data);
                toggleModal();
              } catch (error) {
                setError("root", {
                  message: (error as Error)?.message ?? "Something went wrong!",
                });
              }
            })}
          >
            Submit
          </Button>
        )}
      </ModalFooter>
    </>
  );
};

const PrerequisitesForm = () => {
  const {
    methods: {
      handleSubmit,
      control,
      formState: { errors, isSubmitting },
      setError,
    },
    onClose,
    submitForm,
    setStep,
    toggleModal,
  } = useContext(EditScheduleModalContext);

  const courses = useWatch({
    control,
    name: "courses",
  });

  return (
    <>
      <ModalHeader fontSize="2xl">Edit Prerequisites</ModalHeader>
      <ModalCloseButton size="lg" />

      <ModalBody>
        <>
          <Text color="red.200">{errors?.root?.message}</Text>
          <Grid gap="2rem">
            {courses.map((field, i) => (
              <Box key={field.uuid}>
                <Heading size="md" py="2">
                  {field.letters + field.number}
                </Heading>

                <Controller
                  name={`courses.${i}.prerequisites` as const}
                  control={control}
                  render={({ field: { onChange, value, ref, name } }) => {
                    const options = courses
                      .filter(otherCourse => otherCourse.uuid !== field.uuid)
                      .map(({ uuid, letters, number }) => ({
                        value: uuid,
                        label: letters + number,
                      }));

                    const selectValue = value.map(courseId => {
                      const course = courses.find(
                        otherCourse => otherCourse.uuid === courseId
                      );
                      return course
                        ? {
                            value: course.uuid,
                            label: course.letters + course.number,
                          }
                        : course;
                    });

                    return (
                      <Select
                        name={name}
                        ref={ref}
                        isMulti
                        isClearable={false}
                        options={options}
                        value={selectValue}
                        menuPosition="fixed"
                        menuPlacement="bottom"
                        menuShouldBlockScroll
                        onChange={selections =>
                          void onChange(
                            selections.map(selection => selection?.value)
                          )
                        }
                      />
                    );
                  }}
                />
              </Box>
            ))}
          </Grid>
        </>
      </ModalBody>

      <ModalFooter gap="1">
        <Button
          rightIcon={<ArrowBackIcon />}
          onClick={() => void setStep(0)}
          mr="auto"
        >
          Back
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          colorScheme="blue"
          mr={3}
          isLoading={isSubmitting}
          onClick={handleSubmit(async data => {
            try {
              await submitForm(data);
              setStep(0);
              toggleModal();
            } catch (error) {
              console.log(error);
              setError("root", {
                message: (error as Error)?.message ?? "Something went wrong!",
              });
            }
          })}
        >
          Submit
        </Button>
      </ModalFooter>
    </>
  );
};
