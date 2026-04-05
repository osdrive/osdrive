import FileProvider
import Foundation
import UniformTypeIdentifiers

enum RustFileProviderModel {
    static let rootIdentifier = "__root__"
    static let workingSetIdentifier = "__working_set__"

    struct Item: Decodable {
        let itemIdentifier: String
        let parentItemIdentifier: String
        let filename: String
        let contentType: String
        let capabilities: UInt
        let childItemCount: UInt?
        let documentSize: UInt?
        let creationTimestamp: TimeInterval
        let contentModificationTimestamp: TimeInterval
        let contentVersion: [UInt8]
        let metadataVersion: [UInt8]
    }

    struct Enumeration: Decodable {
        let items: [Item]
        let syncAnchor: [UInt8]
    }

    static func item(for identifier: NSFileProviderItemIdentifier) -> Item? {
        guard let result = identifierToken(identifier).withCString({ token in
            opendrive_vfs_item_json(token)
        }) else {
            return nil
        }

        defer {
            opendrive_json_result_free(result)
        }

        if result.pointee.error_message != nil {
            return nil
        }

        guard let payload = result.pointee.payload_json else {
            return nil
        }

        let data = Data(String(cString: payload).utf8)
        return try? JSONDecoder().decode(Item.self, from: data)
    }

    static func children(of identifier: NSFileProviderItemIdentifier) -> [Item] {
        guard let result = identifierToken(identifier).withCString({ token in
            opendrive_vfs_children_json(token)
        }) else {
            return []
        }

        defer {
            opendrive_json_result_free(result)
        }

        if result.pointee.error_message != nil {
            return []
        }

        guard let payload = result.pointee.payload_json else {
            return []
        }

        let data = Data(String(cString: payload).utf8)
        return (try? JSONDecoder().decode([Item].self, from: data)) ?? []
    }

    static func enumeration(of identifier: NSFileProviderItemIdentifier) -> Enumeration? {
        guard let result = identifierToken(identifier).withCString({ token in
            opendrive_vfs_enumeration_json(token)
        }) else {
            return nil
        }

        defer {
            opendrive_json_result_free(result)
        }

        if result.pointee.error_message != nil {
            return nil
        }

        guard let payload = result.pointee.payload_json else {
            return nil
        }

        let data = Data(String(cString: payload).utf8)
        return try? JSONDecoder().decode(Enumeration.self, from: data)
    }

    static func syncAnchor() -> NSFileProviderSyncAnchor {
        guard let result = opendrive_vfs_sync_anchor() else {
            return NSFileProviderSyncAnchor(Data())
        }

        defer {
            opendrive_bytes_result_free(result)
        }

        guard let payload = result.pointee.payload_bytes else {
            return NSFileProviderSyncAnchor(Data())
        }

        let data = Data(bytes: payload, count: Int(result.pointee.payload_len))
        return NSFileProviderSyncAnchor(data)
    }

    static func contents(for identifier: NSFileProviderItemIdentifier) -> Data? {
        guard let result = identifierToken(identifier).withCString({ token in
            opendrive_vfs_file_bytes(token)
        }) else {
            return nil
        }

        defer {
            opendrive_bytes_result_free(result)
        }

        if result.pointee.error_message != nil {
            return nil
        }

        guard let payload = result.pointee.payload_bytes else {
            return nil
        }

        return Data(bytes: payload, count: Int(result.pointee.payload_len))
    }

    static func writeContents(for identifier: NSFileProviderItemIdentifier, to url: URL) throws {
        let wroteFile = try identifierToken(identifier).withCString { identifierPointer in
            try url.path.withCString { pathPointer in
                guard let result = opendrive_vfs_write_file(identifierPointer, pathPointer) else {
                    throw CocoaError(.fileWriteUnknown)
                }

                defer {
                    opendrive_json_result_free(result)
                }

                if let errorMessage = result.pointee.error_message {
                    throw NSError(
                        domain: NSCocoaErrorDomain,
                        code: NSFileWriteUnknownError,
                        userInfo: [NSLocalizedDescriptionKey: String(cString: errorMessage)]
                    )
                }

                return true
            }
        }

        if !wroteFile {
            throw CocoaError(.fileWriteUnknown)
        }
    }

    static func materializeItem(for identifier: NSFileProviderItemIdentifier, to url: URL) throws -> Item {
        try identifierToken(identifier).withCString { identifierPointer in
            try url.path.withCString { pathPointer in
                guard let result = opendrive_vfs_materialize_item_json(identifierPointer, pathPointer) else {
                    throw CocoaError(.fileWriteUnknown)
                }

                defer {
                    opendrive_json_result_free(result)
                }

                if let errorMessage = result.pointee.error_message {
                    throw NSError(
                        domain: NSCocoaErrorDomain,
                        code: NSFileWriteUnknownError,
                        userInfo: [NSLocalizedDescriptionKey: String(cString: errorMessage)]
                    )
                }

                guard let payload = result.pointee.payload_json else {
                    throw CocoaError(.fileWriteUnknown)
                }

                let data = Data(String(cString: payload).utf8)
                return try JSONDecoder().decode(Item.self, from: data)
            }
        }
    }

    static func identifier(from token: String) -> NSFileProviderItemIdentifier {
        switch token {
        case rootIdentifier:
            return .rootContainer
        case workingSetIdentifier:
            return .workingSet
        default:
            return NSFileProviderItemIdentifier(token)
        }
    }

    static func identifierToken(_ identifier: NSFileProviderItemIdentifier) -> String {
        if identifier == .rootContainer {
            return rootIdentifier
        }

        if identifier == .workingSet {
            return workingSetIdentifier
        }

        return identifier.rawValue
    }

    static func contentType(_ identifier: String) -> UTType {
        UTType(identifier) ?? .data
    }
}

final class FileProviderItem: NSObject, NSFileProviderItem {
    private let item: RustFileProviderModel.Item

    init(item: RustFileProviderModel.Item) {
        self.item = item
        super.init()
    }

    convenience init?(identifier: NSFileProviderItemIdentifier) {
        guard let item = RustFileProviderModel.item(for: identifier) else {
            return nil
        }

        self.init(item: item)
    }

    var itemIdentifier: NSFileProviderItemIdentifier {
        RustFileProviderModel.identifier(from: item.itemIdentifier)
    }

    var parentItemIdentifier: NSFileProviderItemIdentifier {
        RustFileProviderModel.identifier(from: item.parentItemIdentifier)
    }

    var capabilities: NSFileProviderItemCapabilities {
        NSFileProviderItemCapabilities(rawValue: item.capabilities)
    }

    var itemVersion: NSFileProviderItemVersion {
        NSFileProviderItemVersion(
            contentVersion: Data(item.contentVersion),
            metadataVersion: Data(item.metadataVersion)
        )
    }

    var filename: String {
        item.filename
    }

    var contentType: UTType {
        RustFileProviderModel.contentType(item.contentType)
    }

    var childItemCount: NSNumber? {
        item.childItemCount.map(NSNumber.init(value:))
    }

    var documentSize: NSNumber? {
        item.documentSize.map(NSNumber.init(value:))
    }

    var creationDate: Date? {
        Date(timeIntervalSince1970: item.creationTimestamp)
    }

    var contentModificationDate: Date? {
        Date(timeIntervalSince1970: item.contentModificationTimestamp)
    }
}
