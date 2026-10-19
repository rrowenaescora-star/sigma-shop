/** Lightweight vector decorations with a CSS-only visiting spider. */
export default function HalloweenHeaderDecor() {
  return (
    <div className="halloween-header-decor" aria-hidden="true">
      {[{ thread: 190, size: 1.2 }, { thread: 80, size: .85 }, { thread: 230, size: 1.05 }].map(({ thread, size }, index) => (
      <div className={`halloween-spider-window halloween-spider-${index + 1}`} key={index}>
      <div className="halloween-spider-visit">
        <div className="halloween-spider-swing">
          <svg width="66" height={thread + 40} viewBox={`0 0 66 ${thread + 40}`} fill="none">
            <path d={`M33 0V${thread + 5}`} stroke="#c1addb" strokeOpacity=".7" />
            <g transform={`translate(33 ${thread}) scale(${size}) translate(-33 -143)`}>
            <g stroke="#8e548e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 148L12 139L7 145M21 154L9 150L3 158M22 159L12 164L9 173M44 148L54 139L59 145M45 154L57 150L63 158M44 159L54 164L57 173" />
            </g>
            <ellipse cx="33" cy="148" rx="11" ry="13" fill="#4a245a" />
            <ellipse cx="33" cy="157" rx="14" ry="13" fill="#281832" stroke="#855290" />
            <ellipse cx="28" cy="156" rx="3" ry="4" fill="#ffbc55" />
            <ellipse cx="39" cy="156" rx="3" ry="4" fill="#ffbc55" />
            <circle cx="29" cy="155" r="1" fill="#fff0ca" />
            <circle cx="40" cy="155" r="1" fill="#fff0ca" />
            </g>
          </svg>
        </div>
      </div>
      </div>
      ))}
      <svg className="halloween-corner halloween-corner-left" viewBox="0 0 220 185" fill="none">
        <defs>
          <radialGradient id="halloween-pumpkin"><stop stopColor="#ffac30" /><stop offset=".65" stopColor="#f56a10" /><stop offset="1" stopColor="#9a280c" /></radialGradient>
        </defs>
        <g stroke="#aa79cf" strokeOpacity=".65" strokeWidth="1.5">
          <path d="M0 0L150 0M0 0L142 40M0 0L120 82M0 0L78 115M0 0L35 140M0 0V150" />
          <path d="M0 25Q16 28 25 0M0 52Q16 41 27 45Q30 24 50 0M0 81Q23 64 43 70Q46 48 65 42Q67 16 80 0M0 113Q28 88 61 96Q66 66 90 60Q95 24 113 0M0 145Q36 113 79 117Q86 87 118 81Q122 45 148 40" />
        </g>
        <path d="M57 0Q54 70 61 113M168 0V109" stroke="#9673a6" />
        <g transform="translate(27 109) rotate(-9 33 28)">
          <path d="M30 5Q25-10 38-9" stroke="#6f8e31" strokeWidth="7" />
          <ellipse cx="33" cy="29" rx="33" ry="27" fill="url(#halloween-pumpkin)" />
          <path d="M28 5Q13 30 28 54M39 5Q53 30 39 54" stroke="#a13d09" strokeWidth="2" opacity=".5" />
          <path d="M11 27L24 14L27 29ZM39 29L43 14L56 27ZM12 36L23 39L29 34L35 41L42 35L54 35Q41 58 12 36" fill="#fff29b" />
        </g>
        <g transform="translate(153 108)">
          <path d="M0 13L-9 5L-15 9M0 19L-13 15L-18 23M28 13L37 5L43 9M28 19L41 15L46 23" stroke="#803c67" strokeWidth="3" />
          <ellipse cx="14" cy="14" rx="15" ry="17" fill="#27162f" /><ellipse cx="9" cy="14" rx="3" ry="4" fill="#ffb12e" /><ellipse cx="20" cy="14" rx="3" ry="4" fill="#ffb12e" />
        </g>
      </svg>
      <svg className="halloween-corner halloween-corner-right" viewBox="0 0 220 185" fill="none">
        <g transform="translate(220 0) scale(-1 1)" stroke="#aa79cf" strokeOpacity=".65" strokeWidth="1.5"><path d="M0 0H150M0 0L142 40M0 0L120 82M0 0L78 115M0 0L35 140M0 0V150M0 30Q20 30 30 0M0 65Q22 48 35 50Q40 20 65 0M0 100Q30 72 55 82Q61 49 85 49Q94 20 100 0M0 145Q36 113 79 117Q86 87 118 81Q122 45 148 40" /></g>
        <path d="M167 0V117M102 0V82" stroke="#9673a6" />
        {[{x:140,y:112,s:1},{x:79,y:78,s:.72}].map(({x,y,s})=><g key={x} transform={`translate(${x} ${y}) scale(${s})`}><path d="M25 5Q22-8 32-9" stroke="#6f8e31" strokeWidth="6" /><ellipse cx="27" cy="27" rx="29" ry="26" fill="url(#halloween-pumpkin)" /><path d="M7 25L19 13L22 27ZM32 27L36 13L48 25ZM8 34L18 36L25 32L31 38L39 32L48 33Q30 56 8 34" fill="#fff29b" /></g>)}
      </svg>
    </div>
  );
}
