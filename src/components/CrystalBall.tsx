type DrawState = 'idle' | 'drawing' | 'revealed'

interface Props {
  drawState: DrawState
}

export default function CrystalBall({ drawState }: Props) {
  return (
    <div className={`crystal-wrap ${drawState}`}>
      <div className="crystal-ball">
        <div className="crystal-inner" />
        <div className="crystal-shimmer" />
        <div className="crystal-spark" />
        <div className="crystal-spark spark2" />
      </div>
      <div className="crystal-stand">
        <div className="stand-neck" />
        <div className="stand-base" />
      </div>
      <div className="crystal-floor" />

      <style>{`
        .crystal-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 8px 0 4px;
          position: relative;
          z-index: 15;
        }

        .crystal-ball {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 35%,
            rgba(200, 180, 255, 0.6) 0%,
            rgba(124, 58, 237, 0.5) 30%,
            rgba(60, 20, 120, 0.8) 70%,
            rgba(20, 5, 50, 0.95) 100%
          );
          box-shadow:
            0 0 20px rgba(124, 58, 237, 0.6),
            0 0 50px rgba(124, 58, 237, 0.3),
            0 0 80px rgba(124, 58, 237, 0.15),
            inset 0 0 20px rgba(167, 139, 250, 0.2);
          position: relative;
          overflow: hidden;
          animation: ballIdle 3s ease-in-out infinite;
          transition: box-shadow 0.4s ease;
        }

        .drawing .crystal-ball {
          animation: ballDraw 0.8s ease-in-out infinite;
          box-shadow:
            0 0 30px rgba(124, 58, 237, 0.9),
            0 0 70px rgba(124, 58, 237, 0.5),
            0 0 120px rgba(124, 58, 237, 0.25),
            inset 0 0 30px rgba(167, 139, 250, 0.4);
        }

        .revealed .crystal-ball {
          animation: ballReveal 0.5s ease-out forwards, ballIdle 3s ease-in-out 0.5s infinite;
          box-shadow:
            0 0 25px rgba(124, 58, 237, 0.7),
            0 0 60px rgba(124, 58, 237, 0.35),
            0 0 100px rgba(124, 58, 237, 0.2),
            inset 0 0 25px rgba(167, 139, 250, 0.25);
        }

        @keyframes ballIdle {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.6), 0 0 50px rgba(124,58,237,0.3), 0 0 80px rgba(124,58,237,0.15), inset 0 0 20px rgba(167,139,250,0.2); }
          50% { box-shadow: 0 0 28px rgba(124,58,237,0.7), 0 0 65px rgba(124,58,237,0.35), 0 0 100px rgba(124,58,237,0.2), inset 0 0 25px rgba(167,139,250,0.25); }
        }

        @keyframes ballDraw {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(124,58,237,0.9), 0 0 70px rgba(124,58,237,0.5); }
          50% { transform: scale(1.06); box-shadow: 0 0 50px rgba(124,58,237,1), 0 0 100px rgba(124,58,237,0.6); }
        }

        @keyframes ballReveal {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .crystal-inner {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 60% 60%,
            transparent 40%,
            rgba(124, 58, 237, 0.3) 100%
          );
          border-radius: 50%;
          animation: innerSwirl 6s linear infinite;
        }

        @keyframes innerSwirl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .crystal-shimmer {
          position: absolute;
          top: 15%;
          left: 20%;
          width: 25%;
          height: 35%;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          filter: blur(4px);
          animation: shimmerFloat 4s ease-in-out infinite;
        }

        @keyframes shimmerFloat {
          0%, 100% { opacity: 0.15; transform: translate(0,0); }
          50% { opacity: 0.3; transform: translate(2px, -2px); }
        }

        .crystal-spark {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #d4a853;
          animation: sparkOrbit 4s linear infinite;
          transform-origin: -20px 0;
          box-shadow: 0 0 6px #d4a853;
        }

        .spark2 {
          animation-delay: -2s;
          background: rgba(167, 139, 250, 0.9);
          box-shadow: 0 0 6px rgba(167, 139, 250, 0.9);
          transform-origin: 20px 0;
          animation-name: sparkOrbit2;
        }

        @keyframes sparkOrbit {
          from { transform: rotate(0deg) translateX(-20px); }
          to { transform: rotate(360deg) translateX(-20px); }
        }

        @keyframes sparkOrbit2 {
          from { transform: rotate(0deg) translateX(20px); }
          to { transform: rotate(-360deg) translateX(20px); }
        }

        /* STAND */
        .crystal-stand {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stand-neck {
          width: 20px;
          height: 14px;
          background: linear-gradient(to bottom, rgba(212,168,83,0.6), rgba(150,100,40,0.4));
          clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
        }

        .stand-base {
          width: 52px;
          height: 8px;
          background: linear-gradient(to bottom, rgba(212,168,83,0.5), rgba(150,100,40,0.3));
          border-radius: 4px 4px 2px 2px;
        }

        /* FLOOR SIGIL */
        .crystal-floor {
          width: 120px;
          height: 12px;
          background: radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%);
          border-radius: 50%;
          margin-top: 2px;
        }
      `}</style>
    </div>
  )
}
