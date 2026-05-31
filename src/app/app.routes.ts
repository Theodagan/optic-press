import { Routes } from '@angular/router';

import { TOOLS } from './models/tool';
import { Home } from './pages/home/home';
import { ToolWorkspace } from './pages/tools/tool-workspace/tool-workspace';

export const routes: Routes = [
  { path: '', component: Home, title: 'OPTICPRESS' },
  ...TOOLS.map((tool) => ({
    path: tool.slug,
    component: ToolWorkspace,
    title: `${tool.name} | OPTICPRESS`,
    data: { tool },
  })),
  { path: '**', redirectTo: '' },
];
