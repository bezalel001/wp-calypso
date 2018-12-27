/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
// GUTENLYPSO START
import { connect } from 'react-redux';
import page from 'page';
// GUTENLYPSO END

/**
 * WordPress dependencies
 */
import { Button, Popover, ScrollLock, navigateRegions } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	AutosaveMonitor,
	UnsavedChangesWarning,
	EditorNotices,
	PostPublishPanel,
	PreserveScrollInReorder,
} from '@wordpress/editor';
import { withDispatch, withSelect } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { PluginArea } from '@wordpress/plugins';
import { withViewportMatch } from '@wordpress/viewport';
import { compose } from '@wordpress/compose';
import { parse } from '@wordpress/blocks';
import { PluginPostPublishPanel, PluginPrePublishPanel } from '@wordpress/edit-post'; // GUTENLYPSO

/**
 * Internal dependencies
 */
import Header from '../header';
import TextEditor from '../text-editor';
import VisualEditor from '../visual-editor';
import EditorModeKeyboardShortcuts from '../keyboard-shortcuts';
import KeyboardShortcutHelpModal from '../keyboard-shortcut-help-modal';
import OptionsModal from '../options-modal';
import MetaBoxes from '../meta-boxes';
import SettingsSidebar from '../sidebar/settings-sidebar';
import Sidebar from '../sidebar';
// GUTENLYPSO START
import BrowserURL from 'gutenberg/editor/browser-url';
import EditorRestorePostDialog from 'post-editor/restore-post-dialog';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';
// GUTENLYPSO END

function Layout( {
	mode,
	editorSidebarOpened,
	pluginSidebarOpened,
	publishSidebarOpened,
	hasFixedToolbar,
	closePublishSidebar,
	togglePublishSidebar,
	hasActiveMetaboxes,
	isSaving,
	isMobileViewport,
	isRichEditingEnabled,
	// GUTENLYPSO START
	editPost,
	savePost,
	updatePost,
	resetBlocks,
	post,
	isTrash,
	trashUrl,
	// GUTENLYPSO END
} ) {
	const sidebarIsOpened = editorSidebarOpened || pluginSidebarOpened || publishSidebarOpened;

	const className = classnames( 'edit-post-layout', {
		'is-sidebar-opened': sidebarIsOpened,
		'has-fixed-toolbar': hasFixedToolbar,
		'wp-embed-responsive': true, //GUTENLYPSO
	} );

	const publishLandmarkProps = {
		role: 'region',
		/* translators: accessibility text for the publish landmark region. */
		'aria-label': __( 'Editor publish' ),
		tabIndex: -1,
	};

	// GUTENLYPSO START
	// @see https://github.com/Automattic/wp-calypso/blob/f1822838b984651bfc71ac26ee29ed13fcc86353/client/post-editor/post-editor.jsx#L557-L560
	const navigateBack = () => {
		page.back( trashUrl );
	};

	const restorePost = () => {
		editPost( { status: 'draft' } );
		savePost();
	};

	const loadRevision = revision => {
		const { post_content: content, post_title: title, post_excerpt: excerpt } = revision;
		const postRevision = { ...post, content, title, excerpt };
		//update post does not automatically update content/blocks intentionally
		updatePost( postRevision );
		const blocks = parse( content );
		resetBlocks( blocks );
	};
	// GUTENLYPSO END

	return (
		<div className={ className }>
			<BrowserURL />
			<UnsavedChangesWarning />
			<AutosaveMonitor />
			<Header />
			<div
				className="edit-post-layout__content"
				role="region"
				/* translators: accessibility text for the content landmark region. */
				aria-label={ __( 'Editor content' ) }
				tabIndex="-1"
			>
				<EditorNotices />
				<PreserveScrollInReorder />
				<EditorModeKeyboardShortcuts />
				<KeyboardShortcutHelpModal />
				<OptionsModal />
				{ ( mode === 'text' || ! isRichEditingEnabled ) && <TextEditor /> }
				{ isRichEditingEnabled && mode === 'visual' && <VisualEditor /> }
				<div className="edit-post-layout__metaboxes">
					<MetaBoxes location="normal" />
				</div>
				<div className="edit-post-layout__metaboxes">
					<MetaBoxes location="advanced" />
				</div>
			</div>
			{ /* GUTENLYPSO START */ isTrash && (
				<EditorRestorePostDialog onClose={ navigateBack } onRestore={ restorePost } />
			) }
			<EditorRevisionsDialog loadRevision={ loadRevision } /> { /* GUTENLYPSO END */ }
			{ publishSidebarOpened ? (
				<PostPublishPanel
					{ ...publishLandmarkProps }
					onClose={ closePublishSidebar }
					forceIsDirty={ hasActiveMetaboxes }
					forceIsSaving={ isSaving }
					PrePublishExtension={ PluginPrePublishPanel.Slot }
					PostPublishExtension={ PluginPostPublishPanel.Slot }
				/>
			) : (
				<Fragment>
					<div className="edit-post-toggle-publish-panel" { ...publishLandmarkProps }>
						<Button
							isDefault
							type="button"
							className="edit-post-toggle-publish-panel__button"
							onClick={ togglePublishSidebar }
							aria-expanded={ false }
						>
							{ __( 'Open publish panel' ) }
						</Button>
					</div>
					<SettingsSidebar />
					<Sidebar.Slot />
					{ isMobileViewport && sidebarIsOpened && <ScrollLock /> }
				</Fragment>
			) }
			<Popover.Slot />
			<PluginArea />
		</div>
	);
}

export default compose(
	withSelect( select => ( {
		mode: select( 'core/edit-post' ).getEditorMode(),
		editorSidebarOpened: select( 'core/edit-post' ).isEditorSidebarOpened(),
		pluginSidebarOpened: select( 'core/edit-post' ).isPluginSidebarOpened(),
		publishSidebarOpened: select( 'core/edit-post' ).isPublishSidebarOpened(),
		hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ),
		hasActiveMetaboxes: select( 'core/edit-post' ).hasMetaBoxes(),
		isSaving: select( 'core/edit-post' ).isSavingMetaBoxes(),
		isRichEditingEnabled: select( 'core/editor' ).getEditorSettings().richEditingEnabled,
		// GUTENLYPSO START
		post: select( 'core/editor' ).getCurrentPost(),
		postType: select( 'core/editor' ).getCurrentPostType(),
		isTrash: 'trash' === select( 'core/editor' ).getEditedPostAttribute( 'status' ),
		// GUTENLYPSO END
	} ) ),
	withDispatch( dispatch => {
		const { editPost, savePost, updatePost, resetBlocks } = dispatch( 'core/editor' ); // GUTENLYPSO
		const { closePublishSidebar, togglePublishSidebar } = dispatch( 'core/edit-post' );
		return {
			closePublishSidebar,
			togglePublishSidebar,
			// GUTENLYPSO START
			editPost,
			savePost,
			updatePost,
			resetBlocks,
			// GUTENLYPSO END
		};
	} ),
	navigateRegions,
	withViewportMatch( { isMobileViewport: '< small' } )
)(
	// GUTENLYPSO START
	connect( ( state, { postType } ) => ( {
		trashUrl: getPostTypeTrashUrl( state, postType ),
	} ) )( Layout )
	// GUTENLYPSO END
);
