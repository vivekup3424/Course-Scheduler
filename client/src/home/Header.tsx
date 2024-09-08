import {
  Button,
  Heading,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useAuthStore } from "../auth/auth-store";
import EditScheduleModal from "./EditScheduleModal";

const Header = () => {
  const headerBg = useColorModeValue("white", "bg");
  const { username } = useAuthStore();

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onToggle: toggleModal,
  } = useDisclosure();

  return (
    <>
      <VStack
        justify="space-evenly"
        gap="1rem"
        pos="sticky"
        top="0"
        pb="4"
        mb="4"
        shadow="lg"
        bgColor={headerBg}
        // override default stacking
        // other positioned elements later in the DOM would render on top
        zIndex="1"
      >
        <Heading textAlign="center" py="4">
          {username}'s School Schedule
        </Heading>
        <Button size="lg" onClick={openModal}>
          Edit Schedule
        </Button>
      </VStack>
      <EditScheduleModal isModalOpen={isModalOpen} toggleModal={toggleModal} />
    </>
  );
};

export default Header;
