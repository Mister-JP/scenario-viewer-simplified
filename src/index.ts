// src/index.ts
import { log, error } from './utils/logger';
import { html, render } from 'lit-html';
import { renderApp } from './templates/app';
import { setupDragAndDrop } from './interactions/card-drag';
import { setupConnectionSystem } from './interactions/connections';
import { initializeLayoutPersistence } from './interactions/layout';
import { loadDefaultCards } from './state/loading';
import { atom } from 'nanostores';


console.log('%c=== Application Starting ===', 'background: blue; color: white; padding: 5px');
console.table({
  'Timestamp': new Date().toISOString(),
  'Window Loaded': document.readyState,
  'Logger Available': typeof log,
  'Atoms Available': typeof atom
});


log('Script execution started');

// Create a dirty flag to track state changes
const $isDirty = atom<boolean>(false);
log('Dirty flag atom created');

// Track all state atoms for change detection
const stateAtoms = new Set<any>();
log('State atoms set initialized');

// Initialize the application when DOM is ready
log('Adding DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', () => {
  log('DOM Content Loaded');
  const appRoot = document.getElementById('workspace');
  
  log('Looking for workspace element');
  if (!appRoot) {
    error('Cannot initialize: workspace element not found');
    // Let's check what's in the document
    log('Document body content preview:', document.body.innerHTML.slice(0, 200));
    throw new Error('Cannot initialize: workspace element not found');
  }
  log('Found workspace element', { id: appRoot.id, className: appRoot.className });

  log('Subscribing to state changes');
  subscribeToStateChanges();
  
  log('Initializing layout persistence');
  initializeLayoutPersistence();
  
  log('Loading default cards');
  loadDefaultCards();
  
  log('Performing initial render');
  render(renderApp(), appRoot);
  
  // Set up interactions AFTER initial render
  log('Scheduling interaction setup after render');
  requestAnimationFrame(() => {
    log('Setting up drag and drop');
    setupDragAndDrop();
    log('Setting up connection system');
    setupConnectionSystem();
    log('All interactions set up');
  });
  
  log('Starting render loop');
  runRenderLoop();
});

function runRenderLoop() {
  log('Render loop initialized');
  function renderLoop() {
    if ($isDirty.get()) {
      log('Dirty flag set, re-rendering');
      const appRoot = document.getElementById('workspace');
      if (appRoot) {
        render(renderApp(), appRoot);
        log('Re-render complete');
        $isDirty.set(false);
      } else {
        error('Lost workspace element during render loop');
      }
    }
    requestAnimationFrame(renderLoop);
  }
  
  requestAnimationFrame(renderLoop);
}

function subscribeToStateChanges() {
  log('Starting state change subscriptions');
  import('./state').then(state => {
    log('State module imported successfully');
    const { $allCards, $allConnections, $activeDraggedCard, $pendingConnection, $hostUrl } = state;
    
    log('Subscribing to state atoms');
    [
      $allCards,
      $allConnections, 
      $activeDraggedCard,
      $pendingConnection,
      $hostUrl
    ].forEach((atom, index) => {
      const name = ['$allCards', '$allConnections', '$activeDraggedCard', '$pendingConnection', '$hostUrl'][index];
      stateAtoms.add(atom);
      atom.subscribe(() => {
        log(`State change detected in ${name}`);
        $isDirty.set(true);
      });
      log(`Subscribed to ${name}`);
    });
    
    log('All state subscriptions complete');
  }).catch(err => {
    error('Failed to import state module', err);
  });
}

log('End of index.ts file execution');