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
      <h1>Vite + React</h1>
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
        Click on the Vite and React logos to learn more
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
