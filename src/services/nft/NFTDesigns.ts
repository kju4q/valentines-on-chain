export const generateNFTImage = (
  type: "first" | "milestone",
  milestone?: number
) => {
  if (type === "first") {
    // First gift NFT - Pink heart with sparkles
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="#FDE6F0"/>
        <path d="M341.4 168.6C320.8 148 289.2 148 268.6 168.6L250 187.2L231.4 168.6C210.8 148 179.2 148 158.6 168.6C138 189.2 138 220.8 158.6 241.4L250 332.8L341.4 241.4C362 220.8 362 189.2 341.4 168.6Z" fill="#EC4899"/>
        <circle cx="150" cy="150" r="10" fill="#FFD700">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="350" cy="150" r="10" fill="#FFD700">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        <circle cx="250" cy="350" r="10" fill="#FFD700">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s"/>
        </circle>
      </svg>
    `)}`;
  } else {
    // Milestone NFT - Multiple hearts with milestone number
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="#FDE6F0"/>
        <path d="M291.4 148.6C270.8 128 239.2 128 218.6 148.6L200 167.2L181.4 148.6C160.8 128 129.2 128 108.6 148.6C88 169.2 88 200.8 108.6 221.4L200 312.8L291.4 221.4C312 200.8 312 169.2 291.4 148.6Z" fill="#EC4899" opacity="0.6"/>
        <path d="M391.4 188.6C370.8 168 339.2 168 318.6 188.6L300 207.2L281.4 188.6C260.8 168 229.2 168 208.6 188.6C188 209.2 188 240.8 208.6 261.4L300 352.8L391.4 261.4C412 240.8 412 209.2 391.4 188.6Z" fill="#EC4899"/>
        <text x="250" y="250" font-size="60" fill="#EC4899" text-anchor="middle" dominant-baseline="middle">${milestone}</text>
      </svg>
    `)}`;
  }
};
