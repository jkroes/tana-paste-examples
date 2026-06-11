{
  "translatorID":"dda092d2-a257-46af-b9a3-2f04a55cb04f",
  "translatorType":2,
  "label":"Tana Metadata Export",
  "creator":"Stian Håklev based on Joel Chan's work",
  "target":"md",
  "minVersion":"2.0",
  "maxVersion":"",
  "priority":200,
  "inRepository":false,
  "lastUpdated":"2026-06-11 - 08:30"
  }

  // Maps each supported Zotero item type to its Tana supertag (all extend
  // #zotero in the Tana schema) and the type-specific source fields for the
  // shared Publication / Publisher / Identifier fields. Items whose type is
  // not listed here are skipped entirely.
  //
  // creatorRoles defaults to ['author']. editorFallback uses editors only
  // when an item has no authors (edited volumes).
  var TYPE_CONFIG = {
    blogPost:         { tag: 'blog-post',         publication: ['blogTitle'] },
    book:             { tag: 'book',              publisher: ['publisher'], identifier: ['ISBN'], editorFallback: true },
    bookSection:      { tag: 'book-section',      publication: ['bookTitle'], publisher: ['publisher'], identifier: ['ISBN'], editorFallback: true },
    case:             { tag: 'case',              publication: ['reporter'], identifier: ['docketNumber'] },
    conferencePaper:  { tag: 'conference-paper',  publication: ['proceedingsTitle', 'conferenceName'], publisher: ['publisher'] },
    document:         { tag: 'document',          publisher: ['publisher'] },
    forumPost:        { tag: 'forum-post',        publication: ['forumTitle'] },
    journalArticle:   { tag: 'journal-article',   publication: ['publicationTitle'] },
    manuscript:       { tag: 'manuscript',        publisher: ['institution'], identifier: ['number'] },
    newspaperArticle: { tag: 'newspaper-article', publication: ['publicationTitle'], publisher: ['publisher'] },
    podcast:          { tag: 'podcast',           publication: ['seriesTitle'], publisher: ['publisher'], identifier: ['episodeNumber'], creatorRoles: ['podcaster', 'guest'] },
    presentation:     { tag: 'presentation',      publication: ['meetingName'], creatorRoles: ['presenter'] },
    report:           { tag: 'report',            publication: ['seriesTitle'], publisher: ['institution'], identifier: ['reportNumber'] },
    statute:          { tag: 'statute',           publication: ['code'], identifier: ['publicLawNumber'] },
    webpage:          { tag: 'webpage',           publication: ['websiteTitle'], publisher: ['publisher'] }
  };

  function firstValue(item, fields) {
    if (!fields) return '';
    for (var i = 0; i < fields.length; i++) {
      if (item[fields[i]]) return item[fields[i]];
    }
    return '';
  }

  function pickCreators(item, config) {
    var creators = item.creators || [];
    var roles = config.creatorRoles || ['author'];
    var picked = creators.filter(function (c) {
      return roles.indexOf(c.creatorType) !== -1;
    });
    if (!picked.length && config.editorFallback) {
      picked = creators.filter(function (c) {
        return c.creatorType === 'editor';
      });
    }
    return picked;
  }

  function creatorName(creator) {
    if (creator.name) return creator.name; // institutional/single-field names
    return ((creator.firstName || '') + ' ' + (creator.lastName || '')).trim();
  }

  function tanaDate(raw) {
    if (!raw) return '';
    var date = Zotero.Utilities.strToDate(raw);
    var s = '';
    // month is 0-indexed, so test against undefined or January is dropped
    if (date.year) s += String(date.year).padStart(4, '0');
    if (s && date.month !== undefined) s += '-' + String(date.month + 1).padStart(2, '0');
    if (s && date.day) s += '-' + String(date.day).padStart(2, '0');
    return s ? '[[date:' + s + ']]' : '';
  }

  function doExport() {
    Zotero.write('%%tana%%\n');
    var item;
    while (item = Zotero.nextItem()) {
      var config = TYPE_CONFIG[item.itemType];
      if (!config) continue;

      // case and statute name their title field differently
      var title = item.title || item.caseName || item.nameOfAct || 'Untitled';
      Zotero.write('- ' + title + ' #' + config.tag + '\n');

      // No Status line: the field's default ("Inbox") materializes when the
      // tag is applied. Pasting an explicit Status:: collides with that
      // default-created instance in the app and spawns a duplicate field.

      var libraryID = item.libraryID ? item.libraryID : 0;
      Zotero.write('  - Item:: [Open in Zotero](zotero://select/items/' + libraryID + '_' + item.key + ')\n');

      var creators = pickCreators(item, config);
      if (creators.length) {
        Zotero.write('  - Creator::\n');
        for (var i = 0; i < creators.length; i++) {
          Zotero.write('    - [[' + creatorName(creators[i]) + ' #Person]]\n');
        }
      }

      var dateString = tanaDate(item.date || item.dateDecided || item.dateEnacted);
      if (dateString) Zotero.write('  - Date:: ' + dateString + '\n');

      if (item.url) Zotero.write('  - Link:: ' + item.url + '\n');

      var publication = firstValue(item, config.publication);
      if (publication) Zotero.write('  - Publication:: ' + publication + '\n');

      var publisher = firstValue(item, config.publisher);
      if (publisher) Zotero.write('  - Publisher:: ' + publisher + '\n');

      // every type falls back to DOI, which Zotero allows on all items
      var identifier = firstValue(item, config.identifier) || item.DOI;
      if (identifier) Zotero.write('  - Identifier:: ' + identifier + '\n');

      if (item.itemType === 'case' && item.court) {
        Zotero.write('  - Court:: ' + item.court + '\n');
      }
    }
  }
