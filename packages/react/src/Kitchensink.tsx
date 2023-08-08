import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Flex, RadioGroup, Text } from "@radix-ui/themes";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Tailwind + Typescript + Radix-UI/Themes</h1>
      <div className="card">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="text-red-400"
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        This class <code>read-the-docs</code> has been <code>@apply</code>'d to be <code>text-sm</code>
        <div className="text-sm">This text is also small.</div>
      </p>
      <p className="read-the-docs">
        Tailwind CSS Testing is <code>tailwindcss</code>
        <div className="text-lg">
          Large text
        </div>
        <div className="text-sm">
          Small text
        </div>
        <div className="mt-2 hover:text-sm border-2 border-black">Margin top 2 text that becomes smaller when hovered.</div>
      </p>

      <RadioGroup.Root defaultValue="1">
        <Flex gap="1" direction="column">
          <label>
            <Flex gap="2" align="center">
              <RadioGroup.Item value="1" />
              <Text>Default</Text>
            </Flex>
          </label>
          <label>
            <Flex gap="2" align="center">
              <RadioGroup.Item value="2" />
              <Text>Comfortable</Text>
            </Flex>
          </label>
          <label>
            <Flex gap="2" align="center">
              <RadioGroup.Item value="3" />
              <Text>Compact</Text>
            </Flex>
          </label>
        </Flex>
      </RadioGroup.Root>
    </>
  );
}

export default App;
