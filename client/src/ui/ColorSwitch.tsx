import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { IconButton, useColorMode } from "@chakra-ui/react";

const ColorSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      pos="fixed"
      zIndex={2}
      top="0"
      right="0"
      m="1rem"
      aria-label="Button to toggle the color mode"
      onClick={toggleColorMode}
      icon={
        colorMode === "light" ? (
          <MoonIcon color="blue.700" />
        ) : (
          <SunIcon color="orange.200" />
        )
      }
    />
  );
};

export default ColorSwitch;
