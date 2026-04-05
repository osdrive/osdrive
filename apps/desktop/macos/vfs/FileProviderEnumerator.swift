//
//  FileProviderEnumerator.swift
//  vfs
//
//  Created by Oscar Beaumont on 5/4/2026.
//

import FileProvider

final class FileProviderEnumerator: NSObject, NSFileProviderEnumerator {
    private let enumeratedItemIdentifier: NSFileProviderItemIdentifier
    private let anchor = RustFileProviderModel.syncAnchor()

    init(enumeratedItemIdentifier: NSFileProviderItemIdentifier) {
        self.enumeratedItemIdentifier = enumeratedItemIdentifier
        super.init()
    }

    func invalidate() {
        // TODO: perform invalidation of server connection if necessary
    }

    func enumerateItems(for observer: NSFileProviderEnumerationObserver, startingAt page: NSFileProviderPage) {
        let items: [NSFileProviderItem]

        switch enumeratedItemIdentifier {
        case .rootContainer:
            items = RustFileProviderModel.children(of: .rootContainer).map(FileProviderItem.init(item:))
        case .workingSet:
            items = []
        default:
            observer.finishEnumeratingWithError(NSFileProviderError(.noSuchItem))
            return
        }

        observer.didEnumerate(items)
        observer.finishEnumerating(upTo: nil)
    }

    func enumerateChanges(for observer: NSFileProviderChangeObserver, from anchor: NSFileProviderSyncAnchor) {
        observer.finishEnumeratingChanges(upTo: anchor, moreComing: false)
    }

    func currentSyncAnchor(completionHandler: @escaping (NSFileProviderSyncAnchor?) -> Void) {
        completionHandler(anchor)
    }
}
