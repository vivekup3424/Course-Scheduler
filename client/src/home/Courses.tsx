import {
  Checkbox,
  Container,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuthStore } from "../auth/auth-store";
import env from "../env";
import { Course, scheduleSchema, useScheduleStore } from "./schedule-store";

const submitCourses = async (courses: Course[], token: string) => {
  try {
    const response = await fetch(`${env.serverUrl}/api/schedule`, {
      method: "POST",
      body: JSON.stringify({ courses }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const responseData = await response.json();
    const newSchedule = scheduleSchema.parse(responseData);
    console.log(`newSchedule: ${JSON.stringify(newSchedule, null, 2)}`);
  } catch (error) {
    console.log(error);
  }
};

const Courses = () => {
  const token = useAuthStore(store => store.token);
  const { courses } = useScheduleStore();
  const courseBg = useColorModeValue("gray.100", "#343434");

  const graph = new Map<string, string[]>();
  const courseMap = new Map<string, Course>();
  const inDegreeMap = new Map<string, number>();

  for (const course of courses) {
    courseMap.set(course.uuid, course);
  }

  for (const course of courses) {
    let inDegree = 0;
    for (const prereqUuid of course.prerequisites) {
      const prereqAdjList = graph.get(prereqUuid) ?? [];
      inDegree += Number(courseMap.get(prereqUuid)?.status === "AVAILABLE");
      prereqAdjList.push(course.uuid);
      graph.set(prereqUuid, prereqAdjList);
    }
    inDegreeMap.set(course.uuid, inDegree);
  }

  const uncompleteCourse = (newCourse: Course) => {
    newCourse.status = "AVAILABLE";
    const neighborUuids = graph.get(newCourse.uuid) ?? [];
    for (const neighborUuid of neighborUuids) {
      const neighbor = courseMap.get(neighborUuid);
      if (!neighbor || neighbor.status === "AVAILABLE") continue;
      uncompleteCourse(neighbor);
    }
  };

  const onCourseStatusChange =
    (course: Course) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newCourses = structuredClone(courses);
      const newCourse = newCourses[course.courseIndex];

      if (e.target.checked) {
        newCourse.status = "COMPLETED";
        submitCourses(newCourses, token);
        useScheduleStore.setState({
          courses: newCourses,
        });
      } else {
        for (const c of newCourses) {
          courseMap.set(c.uuid, c);
        }
        uncompleteCourse(newCourse);
        submitCourses(newCourses, token);
        useScheduleStore.setState({
          courses: newCourses,
        });
      }
    };

  return (
    <Container>
      {courses.map(course => (
        <Flex
          key={course.uuid}
          w="100%"
          bg={courseBg}
          border="1px"
          mb="4"
          rounded="xl"
          justify="space-between"
          align="center"
          p="4"
          shadow="md"
          opacity={inDegreeMap.get(course.uuid) ? 0.2 : 1}
        >
          <Text fontSize="lg">{course.letters + course.number}</Text>
          <Checkbox
            transitionDelay="0s"
            value={course.uuid}
            isDisabled={!!inDegreeMap.get(course.uuid)}
            isChecked={course.status === "COMPLETED"}
            onChange={onCourseStatusChange(course)}
          >
            Completed
          </Checkbox>
        </Flex>
      ))}
    </Container>
  );
};

export default Courses;
