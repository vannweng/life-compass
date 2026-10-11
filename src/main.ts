/**
 * @description 應用程式進入點
 * @module main
 */

import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/views.css';
import './styles/views-goals-review.css';
import './styles/responsive.css';
import './styles/goal-library.css';
import './styles/history-calendar.css';
import { App } from './App';

const root = document.getElementById('app-root');
if (root) new App(root).start();
