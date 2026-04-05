//
//  FileProviderExtension.swift
//  vfs
//
//  Created by Oscar Beaumont on 5/4/2026.
//

import FileProvider
import Foundation
final class FileProviderExtension: NSObject, NSFileProviderReplicatedExtension {
    private let domain: NSFileProviderDomain

    required init(domain: NSFileProviderDomain) {
        self.domain = domain
        super.init()
    }

    func invalidate() {
    }

    func item(for identifier: NSFileProviderItemIdentifier, request: NSFileProviderRequest, completionHandler: @escaping (NSFileProviderItem?, Error?) -> Void) -> Progress {
        let item = FileProviderItem(identifier: identifier)
        completionHandler(item, item == nil ? NSFileProviderError(.noSuchItem) : nil)
        return Progress()
    }

    func fetchContents(for itemIdentifier: NSFileProviderItemIdentifier, version requestedVersion: NSFileProviderItemVersion?, request: NSFileProviderRequest, completionHandler: @escaping (URL?, NSFileProviderItem?, Error?) -> Void) -> Progress {
        guard let manager = NSFileProviderManager(for: domain) else {
            completionHandler(nil, nil, NSFileProviderError(.noSuchItem))
            return Progress()
        }

        do {
            let temporaryDirectoryURL = try manager.temporaryDirectoryURL()
            let fileURL = temporaryDirectoryURL.appendingPathComponent(RustFileProviderModel.identifierToken(itemIdentifier))

            if FileManager.default.fileExists(atPath: fileURL.path()) {
                try FileManager.default.removeItem(at: fileURL)
            }

            let item = try FileProviderItem(item: RustFileProviderModel.materializeItem(for: itemIdentifier, to: fileURL))
            completionHandler(fileURL, item, nil)
        } catch {
            completionHandler(nil, nil, error)
        }

        return Progress()
    }

    func createItem(basedOn itemTemplate: NSFileProviderItem, fields: NSFileProviderItemFields, contents url: URL?, options: NSFileProviderCreateItemOptions = [], request: NSFileProviderRequest, completionHandler: @escaping (NSFileProviderItem?, NSFileProviderItemFields, Bool, Error?) -> Void) -> Progress {
        completionHandler(nil, [], false, NSError(domain: NSCocoaErrorDomain, code: NSFeatureUnsupportedError))
        return Progress()
    }

    func modifyItem(_ item: NSFileProviderItem, baseVersion version: NSFileProviderItemVersion, changedFields: NSFileProviderItemFields, contents newContents: URL?, options: NSFileProviderModifyItemOptions = [], request: NSFileProviderRequest, completionHandler: @escaping (NSFileProviderItem?, NSFileProviderItemFields, Bool, Error?) -> Void) -> Progress {
        completionHandler(nil, [], false, NSError(domain: NSCocoaErrorDomain, code: NSFeatureUnsupportedError))
        return Progress()
    }

    func deleteItem(identifier: NSFileProviderItemIdentifier, baseVersion version: NSFileProviderItemVersion, options: NSFileProviderDeleteItemOptions = [], request: NSFileProviderRequest, completionHandler: @escaping (Error?) -> Void) -> Progress {
        completionHandler(NSError(domain: NSCocoaErrorDomain, code: NSFeatureUnsupportedError))
        return Progress()
    }

    func enumerator(for containerItemIdentifier: NSFileProviderItemIdentifier, request: NSFileProviderRequest) throws -> NSFileProviderEnumerator {
        guard RustFileProviderModel.enumeration(of: containerItemIdentifier) != nil else {
            throw NSFileProviderError(.noSuchItem)
        }

        return FileProviderEnumerator(enumeratedItemIdentifier: containerItemIdentifier)
    }
}
