function Board(currentBoard) {
    return (
        <div className="board">
        {currentBoard.map((row, rowIndex) => {
            <div key={rowIndex} className="row">
                {row.map((cell, cellIndex) => {
                    <Cell key={rowIndex - cellIndex} className="cell" type={cell}/>
                })}
            </div>
        })}
        </div>
    );
}