import { toast } from "react-hot-toast";
import styled from "styled-components";

import { SettingsForm } from "./SettingsForm";
import { Button } from "./atoms/Button";

const SettingsButtonWrapper = styled.div`
  display: flex;
  justify-content: left;
  position: fixed;
  bottom: 0.2rem;
  left: 0.6rem;
  right: 0;
`;

export const SettingsButton = () => {
  return (
    <SettingsButtonWrapper>
      <Button
      style={{ fontSize: "small", marginRight: 0 }}
      onClick={(event) => {
        event.preventDefault();

        toast(
            <div>
              <SettingsForm />
              <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "8px",
              }}
              >
                <Button
                  style={{ fontSize: "small" }}
                  onClick={() => toast.dismiss()}
                >
                  ✅
                </Button>
              </div>
            </div>,
          {
            id: "settings-toast",
            duration: Infinity,
            position: "bottom-center",
            style: {
              borderRadius: "10px",
              background: "var(--background)",
              color: "var(--text-main)",
            },
            },
          )
        }}
      >
        Options
      </Button>
    </SettingsButtonWrapper>
  );
};
