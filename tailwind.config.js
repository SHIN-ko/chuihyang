/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        // Semantic palette (from DESIGN_TOKENS.json)
        bg: {
          primary: "#0D0F0E",
          secondary: "#1B1F1C",
          input: "#253026"
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#B8BDB6",
          muted: "#7A7F78"
        },
        accent: {
          primary: "#32FF66",
          secondary: "#28CC52"
        },
        border: {
          light: "#3A403A",
          dark: "#1F241F"
        }
      },
      fontFamily: {
        // Headings: serif, Body: sans
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.5" }],
        md: ["16px", { lineHeight: "1.5" }],
        lg: ["18px", { lineHeight: "1.5" }],
        xl: ["22px", { lineHeight: "1.3" }],   // 섹션 타이틀
        "2xl": ["28px", { lineHeight: "1.2" }] // 대제목(온보딩/상세 헤더)
      },
      spacing: {
        // 8pt grid (+4)
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px"
      },
      borderRadius: {
        sm: "4px",
        md: "8px",   // 버튼/인풋 기본
        lg: "12px",  // 카드
        xl: "16px",
        full: "9999px"
      },
      boxShadow: {
        card: "0 2px 6px rgba(0,0,0,0.40)"
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class" // form 요소에 직접 class 부여
    }),
    require("@tailwindcss/typography")
  ],
  safelist: [
    // 동적 클래스를 코드에서 조합할 경우 대비
    "bg-accent-primary",
    "text-accent-primary",
    "border-border-light",
    "border-border-dark"
  ]
}
