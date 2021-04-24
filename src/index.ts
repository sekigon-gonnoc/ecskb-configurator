import { WebRawHID } from "./webRawHID";

let hid = new WebRawHID();

if (!navigator.hid) {
  alert("Please use chrome or edge");
}

const recvHandler = (msg: Uint8Array) => {
  console.log(
    `recv: ${Array.from(msg)
      .map((v: number) => v.toString(16))
      .join(" ")}`
  );

  if (msg[0] == 2 && msg[1] == 0xec) {
    lowText.valueAsNumber = (msg[2] << 8) + msg[3];
    highText.valueAsNumber = (msg[4] << 8) + msg[5];
  }
};

const lowText = document.getElementById("low") as HTMLInputElement;
const highText = document.getElementById("high") as HTMLInputElement;

const hidOpen = async () => {
  await hid.open(() => {}, {
    filter: [
      { vendorId: 0xfeed, productId: 0xec20, usagePage: 0xff60, usage: 0x61 },
    ],
  });

  hid.setReceiveCallback(recvHandler);
};

document.getElementById("read").addEventListener(
  "click",
  async () => {
    if (hid.connected == false) {
      await hidOpen();
    }

    hid.write(Uint8Array.from([0x02, 0xec]));
  },
  false
);

document.getElementById("write").addEventListener(
  "click",
  async () => {
    if (hid.connected == false) {
      await hidOpen();
    }

    const low = lowText.valueAsNumber;
    const high = highText.valueAsNumber;

    if (low >= high) {
      alert("High threshold should be larger than low");
      return;
    }

    hid.write(
      Uint8Array.from([
        0x03,
        0xec,
        low >> 8,
        low & 0xff,
        high >> 8,
        high & 0xff,
      ])
    );
  },
  false
);

document.getElementById("reset").addEventListener(
  "click",
  async () => {
    if (hid.connected == false) {
      await hidOpen();
    }

    hid.write(Uint8Array.from([0x03, 0xec, 0xff, 0xff, 0xff, 0xff]));
    hid.write(Uint8Array.from([0x02, 0xec]));
  },
  false
);
