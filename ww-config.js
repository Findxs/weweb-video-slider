export default {
  editor: {
    label: {
      en: "Video Slider",
    },
  },
  properties: {
    videos: {
      label: {
        en: "Videos",
      },
      type: "Array",
      defaultValue: [
        {
          url: "https://weweb-production.s3.amazonaws.com/designs/7bbcc9e0-1226-4553-bc79-e03ef78066b4/files/course_1_smartphone.mov",
          poster:"",
          caption: "",
        },
        {
          url: "https://weweb-production.s3.amazonaws.com/designs/7bbcc9e0-1226-4553-bc79-e03ef78066b4/files/course_2_smartphone.mov",
          poster:"",
          caption: ""
        },
        {
          url: "https://weweb-production.s3.amazonaws.com/designs/7bbcc9e0-1226-4553-bc79-e03ef78066b4/files/course_3_smartphone.mov",
          poster:"",
          caption: "",
        },
      ],
      element: {
        type: "Object",
        properties: {
          url: {
            label: { en: "Video URL" },
            type: "Text",
            defaultValue: "",
          },
          poster: {
            label: { en: "Poster URL" },
            type: "Text",
            defaultValue: "",
          },
          caption: {
            label: { en: "Caption" },
            type: "Text",
            defaultValue: "",
          },
        },
      },
    },
    showControls: {
      label: {
        en: "Show controls",
      },
      type: "OnOff",
      defaultValue: true,
    },
    showDots: {
      label: {
        en: "Show dots",
      },
      type: "OnOff",
      defaultValue: true,
    },
    autoPlayMuted: {
      label: {
        en: "Auto-play muted",
      },
      type: "OnOff",
      defaultValue: true,
    },
  },
};
