import React, {useMemo, useRef, useState} from 'react';
import cn from "classnames";
import './App.css';


function App() {
  //включает/выключает рисование
  const [activate, toggleActivate] = useState(false);
  //объект с содержащий координаты мыши внутри svg поля
  const [mousePos, setMousePos] = useState(null);
  //массив содержащий объекты с координатами всех точек
  const [points, setPoints] = useState([]);
  //режим отображения линий (drawing или bezier)
  const [mode, setMode] = useState("drawing");
  //перетаскиваетлся ли в данный момент точка
  const [isMoving, toggleIsMoving] = useState(false);


  const svgFieldRef = useRef(null);
  const actualPosit = useRef(null);
  actualPosit.current = mousePos;


  const addPoint = () => {
    setPoints((points) => {
      return [...points,
        {
          x: mousePos.x,
          y: mousePos.y
        }
      ]
    })
  };

  //перемещает точку при перетаскивании
  const movePoint = (index) => {
    toggleIsMoving(true);
    const changeCoords = () => {
      const arr = points.map((point) => {
        if (point !== points[index]) return point;
        return actualPosit.current;
      });
      setPoints(arr)
    };
    svgFieldRef.current.addEventListener('mousemove', changeCoords);
    window.onmouseup = () => {
      toggleIsMoving(false);
      svgFieldRef.current.removeEventListener('mousemove', changeCoords);
      window.onmouseup = null;
    }
  };

  //Если количество точек превышает 4, то автоматическое переключение
  //в режим drawing.
  if (mode === "bezier" && points.length > 4) {
    setMode("drawing");
  }

  //строка с готовыми координатами для элемента path
  let coords = useMemo(() => {
    if (mode === "drawing" || (mode === "bezier" && points.length < 3)) {
      return points.map((point, index) => {
        if (!index) return `M${point.x},${point.y}`;
        return `L${point.x},${point.y}`
      }).join(" ");
    } else if (mode === "bezier") {
      if (points.length === 3) {
        return `M${points[0].x},${points[0].y} Q ${points[2].x},${points[2].y} 
        ${points[1].x},${points[1].y}`
      }
      if (points.length === 4) {
        return `M${points[0].x},${points[0].y} C ${points[2].x},${points[2].y} 
        ${points[3].x},${points[3].y} ${points[1].x},${points[1].y}`
      }
    }
  }, [points, mode]);


  return (
    <div className="content">
      <svg xmlns="http://www.w3.org/2000/svg"
           className={cn("svg-field", activate && "activated")}
           ref={svgFieldRef}
           onMouseMove={(e) => setMousePos({
             x: e.nativeEvent.offsetX,
             y: e.nativeEvent.offsetY
           })}
           onMouseUp={activate && !isMoving ? addPoint : null}
      >
        <path d={coords} stroke="orange" fill="transparent" strokeWidth={3}/>
        {
          points.map((point, index) => {
            return (
              <circle cx={point.x}
                      cy={point.y}
                      key={index}
                      r={5}
                      stroke="transparent"
                      fill="#ff4d4d"
                      className="circle-point"
                      onMouseDown={(e) => movePoint(index)}
              />
            )
          })
        }
      </svg>
      <div className="control-btns">
        <div className={cn("control-btn", activate && "selected")}
             onClick={() => toggleActivate(s => !s)}>activate
        </div>
        <div className={cn("control-btn", mode === "drawing" && "selected")}
             onClick={() => setMode("drawing")}>drawing
        </div>
        <div className={cn("control-btn", mode === "bezier" && "selected",
          points.length > 4 && "deactivated")}
             onClick={points.length < 5 ? () => setMode("bezier") : null}>bezier
        </div>
        <div className={cn("control-btn", !points.length && "deactivated")}
             onClick={points.length ? () => setPoints([]) : null}>clear
        </div>
      </div>
    </div>
  );
}

export default App;
