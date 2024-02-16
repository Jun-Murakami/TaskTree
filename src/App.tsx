import {SortableTree} from './Tree/SortableTree';
import './App.css'

function App() {

  return (
    <>
      <h1>Task Tree</h1>
      <SortableTree collapsible indicator removable />
    </>
  )
}

export default App
