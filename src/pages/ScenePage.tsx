import { useState } from "react";
import TypewriterText from "../components/TypewriterText";
import WheelPicker from "../components/WheelPicker";
import CollapsiblePickerField from "../components/CollapsiblePickerField";
import PageNavFooter from "../components/PageNavFooter";
import { formatScene, SCENE_OPTIONS, type SceneValue } from "../data/scene";

type Props = {
  scene: SceneValue;
  onSceneChange: (value: SceneValue) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function ScenePage({
  scene,
  onSceneChange,
  onPrev,
  onNext,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="page scene-page">

      <main className="page-main">
        <TypewriterText
          text={"在哪个场景下\n你花的时间最多？"}
          className="typewriter-title typewriter-title--multiline"
        />

        <div className="picker-stack">
          <CollapsiblePickerField
            displayValue={formatScene(scene)}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            ariaLabel="选择场景"
          >
            <div className="scene-wheel-picker">
              <WheelPicker
                ariaLabel="场景"
                options={SCENE_OPTIONS}
                value={scene}
                onChange={onSceneChange}
              />
            </div>
          </CollapsiblePickerField>
        </div>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
