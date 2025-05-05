/**
 * APPLICATION HEADER CONTROLS
 * 
 * This template provides the main controls for managing the scenario viewer:
 * saving/loading layouts, resetting the workspace, and managing the content source.
 * 
 * Product Functions:
 * - Layout persistence for team collaboration
 * - Quick workspace reset
 * - Content source management
 */

import { html } from 'lit-html';
import { $hostUrl } from '../state';
import { log } from '../utils/logger';

/**
 * Renders the application header with all control buttons.
 * Product Purpose: Provides power-user features for managing the visualization workspace.
 */
export function renderHeader() {
  const hostUrl = $hostUrl.get();
  
  return html`
    <header class="app-header">
      <h1>Scenario Viewer</h1>
      
      <!-- Content source display and edit -->
      <div class="host-container">
        <span class="host-label">Content Source:</span>
        <span class="host-value">${hostUrl}</span>
        <button 
          class="edit-host-btn"
          @click=${editHostUrl}
          title="Change where scenario content is loaded from"
        >
          Edit
        </button>
      </div>
      
      <!-- Layout management controls -->
      <div class="layout-controls">
        <button 
          class="reset-layout-btn"
          @click=${resetToDefaultLayout}
          title="Arrange all cards in a clean grid"
        >
          Reset Layout
        </button>
        <button 
          class="load-layout-btn"
          @click=${triggerLoadLayout}
          title="Load a previously saved arrangement"
        >
          Load Layout
        </button>
        <button 
          class="save-layout-btn"
          @click=${saveCurrentLayout}
          title="Save current arrangement for future use"
        >
          Save Layout
        </button>
      </div>
      
      <!-- Hidden file input for loading layouts -->
      <input 
        type="file" 
        id="layout-file-input"
        accept=".json"
        style="display: none;"
        @change=${handleLayoutFileSelected}
      />
    </header>
  `;
}

// Header control handlers - these functions trigger actions when buttons are clicked

function editHostUrl() {
    log('Edit host URL clicked');
    const currentUrl = $hostUrl.get();
    const newUrl = prompt('Enter the URL where scenario content is hosted:', currentUrl);
    
    if (newUrl && newUrl !== currentUrl) {
      log('Host URL changing', { from: currentUrl, to: newUrl });
      import('../state').then(({ updateHostUrl }) => {
        updateHostUrl(newUrl);
      });
    } else {
      log('Host URL edit cancelled');
    }
  }
  

  function resetToDefaultLayout() {
    log('Reset layout button clicked');
    import('../interactions/layout').then(({ resetLayout }) => {
      resetLayout();
    });
  }
  

function triggerLoadLayout() {
  document.getElementById('layout-file-input')?.click();
}

function handleLayoutFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (file) {
    import('../interactions/layout').then(({ loadLayoutFromFile }) => {
      loadLayoutFromFile(file);
    });
  }
}

function saveCurrentLayout() {
  import('../interactions/layout').then(({ saveLayoutToFile }) => {
    saveLayoutToFile();
  });
}