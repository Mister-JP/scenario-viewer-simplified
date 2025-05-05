/**
 * CARD DRAGGING INTERACTIONS
 * 
 * This module handles the drag-and-drop functionality that allows users
 * to reposition scenario cards within the workspace. It manages the
 * visual feedback during dragging and updates card positions.
 * 
 * Product Features:
 * - Click and drag cards to rearrange them
 * - Visual feedback during dragging  
 * - Smooth animation for position updates
 * - Brings dragged card to front (prevents hiding)
 */

import { $allCards, $activeDraggedCard, updateCardPosition, bringCardToFront } from '../state';
import { log, error } from '../utils/logger';


/**
 * Initializes the drag-and-drop system for all scenario cards.
 * Product Purpose: Makes cards moveable so teams can organize their workspace.
 */
export function setupDragAndDrop() {
    log('Setting up drag and drop system');
    
    const workspace = document.getElementById('workspace');
    if (!workspace) {
      error('Cannot setup drag and drop: workspace element not found');
      return;
    }
    
    log('Workspace found', { id: workspace.id });
    workspace.addEventListener('pointerdown', handleWorkspaceClick);
  }
  

/**
 * Handles clicks on the workspace to initialize card dragging.
 * Product Behavior: Only allows dragging by the handle to prevent accidental moves.
 */
function handleWorkspaceClick(event: PointerEvent) {
  const handle = (event.target as Element).closest('[data-drag-handle]');
  log('Workspace click event', { hasHandle: !!handle });
  
  if (!handle) return;
  
  const card = handle.closest('.card') as HTMLElement;
  if (!card) {
    error('No card element found for handle');
    return;
  }
  
  const cardId = parseInt(card.dataset.cardId || '', 10);
  if (isNaN(cardId)) {
    error('Invalid card ID', { cardId: card.dataset.cardId });
    return;
  }
  
  log('Card drag initiated', { cardId });
  startDraggingCard(card, cardId, event);
}

/**
 * Initiates card dragging when user clicks on a handle.
 * Product Flow: User grabs handle → card becomes moveable → follows cursor
 */
function startDraggingCard(element: HTMLElement, cardId: number, event: PointerEvent) {
    log('Card drag started', { cardId, x: event.clientX, y: event.clientY });
    
    $activeDraggedCard.set(cardId);
    bringCardToFront(cardId);
    
    const startX = event.clientX;
    const startY = event.clientY;
    const cards = $allCards.get();
    const cardData = cards.find(c => c.id === cardId);
    
    if (!cardData) {
      error('Card data not found', { cardId });
      return;
    }
    
    log('Card initial position', { cardId, x: cardData.x, y: cardData.y });
    
    const initialX = cardData.x;
    const initialY = cardData.y;
    
    function handleMove(moveEvent: PointerEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      log('Card position update', { cardId, x: newX, y: newY, deltaX, deltaY });
      updateCardPosition(cardId, newX, newY);
    }
    
    function handleRelease() {
      const finalPosition = cards.find(c => c.id === cardId);
      log('Card drag ended', { 
        cardId, 
        finalPosition: finalPosition ? { x: finalPosition.x, y: finalPosition.y } : null 
      });
      
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleRelease);
      
      $activeDraggedCard.set(null);
    }
  }