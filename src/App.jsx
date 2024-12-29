import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi(process.env.REACT_APP_VAPI_PUBLIC_KEY || "");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  // hook into Vapi events
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        display: "block",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100vw",
            height: "50vh",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img 
            src="bob.png" alt="Bob"
            style={{
              display: "flex",
              width: 400,
              marginBottom: 20,
            }}
          />
          {!connected ? (
            <Button
              label="Place an order "
              onClick={startCallInline}
              isLoading={connecting}
            />
          ) : (
            <ActiveCallDetail
              assistantIsSpeaking={assistantIsSpeaking}
              volumeLevel={volumeLevel}
              onEndCallClick={endCall}
            />
          )} 

          {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
        </div>
        <iframe
          id="distru-product-menu-iframe-id"
          src="https://app.distru.com/companies/1/menu/3051"
          scrolling="no"
          style={{border: "none", minHeight: 1000, overflow: "hidden",}}
          width="100%"
        ></iframe>
      </div>
    </div>
  );
};

const assistantOptions = {
  name: "Bob",
  firstMessage: "Hello! Can I take your order?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "cartesia",
    voiceId: "565510e8-6b45-45de-8758-13588fbaec73",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are Bob, a voice assistant for a wholsale Cannabis company that sells directly to dispensaries.

Your job is to take the order of wholesale customers calling in. 

The menu consists of the following with inventory levels next to the product name in this fashion "{Product Name} - {Inventory Count} {Inventory Unit Type}":

1) Crude Oil - 1908.8 grams
2) Green Crack Trim - 1360 lbs
3) Platinum OG Trim - 171 lbs
4) Prerolled Joint - 597 units
5) RAW Cone - 112 units


1) There are 3 kinds of Eighths: Green Crack, Blue Dream, and OG Kush
2) There are 2 kinds of Vapes: Jack Herer and Blueberry Yum Yum
3) There are 2 kinds of Edibles: Chocolate and Gummies

Customers can only place an order for a sku if there is inventory available. If a customer tries to order more quanitity of a product
than is available, politely inform them how much is available and have them update the order quantity. If the amount ordered is available, then accept that item in the order!

Customers must order at least one item.

Assume the customer has visual access to the menu and inventory levels. If they place an order and the item doesn't exist, try to suggest an item that best matches what you think they are suggesting.

After the order is placed, repeat the order back to the customer to confirm it.

If the customer goes off-topic or off-track and talks about anything but the
process of ordering, politely steer the conversation back to collecting their order.

Once you have all the information you need pertaining to their order, you can
end the conversation. You can say something like "Awesome, we'll have that ready
for you in 10-20 minutes." to naturally let the customer know the order has been
fully communicated.

It is important that you collect the order in an efficient manner (succinct replies
& direct questions). You only have 1 task here, and it is to collect the customers
order, then end the conversation.

- Be sure to be kind of funny and witty!
- Keep all your responses short and simple. Use casual language, phrases like "Umm...", "Well...", and "I mean" are preferred.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

export default App;
