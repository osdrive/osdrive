import Cocoa
import UniformTypeIdentifiers

private struct UploadResponse: Decodable {
    let shareUrl: String
}

private struct SharedFile {
    let url: URL
    let suggestedName: String
    let contentType: String
}

@MainActor
final class ShareViewController: NSViewController, NSTextFieldDelegate {
    private let titleLabel = NSTextField(labelWithString: "Create share link")
    private let subtitleLabel = NSTextField(labelWithString: "")
    private let displayNameLabel = NSTextField(labelWithString: "Display name")
    private let displayNameField = NSTextField(string: "")
    private let statusLabel = NSTextField(labelWithString: "")
    private let cancelButton = NSButton(title: "Cancel", target: nil, action: nil)
    private let sendButton = NSButton(title: "Upload and copy link", target: nil, action: nil)

    private var sharedFile: SharedFile?
    private var isUploading = false

    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 460, height: 220))
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        preferredContentSize = NSSize(width: 460, height: 220)
        configureUI()

        Task {
            await prepareSharedFile()
        }
    }

    private func configureUI() {
        view.wantsLayer = true

        titleLabel.font = .systemFont(ofSize: 20, weight: .semibold)

        subtitleLabel.font = .systemFont(ofSize: 12)
        subtitleLabel.textColor = .secondaryLabelColor
        subtitleLabel.lineBreakMode = .byTruncatingMiddle

        displayNameLabel.font = .systemFont(ofSize: 12, weight: .medium)
        displayNameField.placeholderString = "Quarterly index export"
        displayNameField.delegate = self
        displayNameField.target = self
        displayNameField.action = #selector(displayNameChanged(_:))

        statusLabel.font = .systemFont(ofSize: 12)
        statusLabel.textColor = .secondaryLabelColor
        statusLabel.lineBreakMode = .byWordWrapping
        statusLabel.maximumNumberOfLines = 3

        cancelButton.target = self
        cancelButton.action = #selector(cancel(_:))

        sendButton.target = self
        sendButton.action = #selector(send(_:))
        sendButton.bezelStyle = .rounded
        sendButton.keyEquivalent = "\r"

        let fieldStack = NSStackView(views: [displayNameLabel, displayNameField])
        fieldStack.orientation = .vertical
        fieldStack.spacing = 6
        fieldStack.alignment = .leading

        let bodyStack = NSStackView(views: [titleLabel, subtitleLabel, fieldStack, statusLabel])
        bodyStack.orientation = .vertical
        bodyStack.spacing = 12
        bodyStack.translatesAutoresizingMaskIntoConstraints = false
        bodyStack.setCustomSpacing(18, after: subtitleLabel)

        let actionStack = NSStackView(views: [cancelButton, sendButton])
        actionStack.orientation = .horizontal
        actionStack.spacing = 8
        actionStack.alignment = .centerY
        actionStack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(bodyStack)
        view.addSubview(actionStack)

        NSLayoutConstraint.activate([
            bodyStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            bodyStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            bodyStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),

            displayNameField.widthAnchor.constraint(equalTo: bodyStack.widthAnchor),

            actionStack.topAnchor.constraint(greaterThanOrEqualTo: bodyStack.bottomAnchor, constant: 18),
            actionStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            actionStack.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),
        ])

        renderIdleState(message: "Loading shared file...")
    }

    @objc
    private func displayNameChanged(_ sender: NSTextField) {
        if sender.stringValue.count > 180 {
            sender.stringValue = String(sender.stringValue.prefix(180))
        }

        updateSendButtonState()
    }

    func controlTextDidChange(_ notification: Notification) {
        guard let field = notification.object as? NSTextField, field == displayNameField else {
            return
        }

        displayNameChanged(field)
    }

    private func updateSendButtonState() {
        let hasFile = sharedFile != nil
        let hasName = !displayNameField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        sendButton.isEnabled = hasFile && hasName && !isUploading
    }

    private func renderIdleState(message: String) {
        statusLabel.stringValue = message
        statusLabel.textColor = .secondaryLabelColor
        displayNameField.isEnabled = !isUploading
        cancelButton.isEnabled = !isUploading
        updateSendButtonState()
    }

    private func renderError(_ message: String) {
        statusLabel.stringValue = message
        statusLabel.textColor = .systemRed
        isUploading = false
        sendButton.title = "Upload and copy link"
        displayNameField.isEnabled = true
        cancelButton.isEnabled = true
        updateSendButtonState()
    }

    private func renderUploading() {
        isUploading = true
        statusLabel.stringValue = "Uploading file and generating a share link..."
        statusLabel.textColor = .secondaryLabelColor
        displayNameField.isEnabled = false
        cancelButton.isEnabled = false
        sendButton.isEnabled = false
        sendButton.title = "Uploading..."
    }

    private func renderReady(file: SharedFile) {
        subtitleLabel.stringValue = file.url.lastPathComponent
        if displayNameField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            displayNameField.stringValue = file.suggestedName
        }

        renderIdleState(message: "The generated share link will be copied to your clipboard.")
    }

    private func renderSuccess(_ shareURL: String) {
        statusLabel.stringValue = "Copied link to clipboard. Closing share sheet..."
        statusLabel.textColor = .systemGreen
        subtitleLabel.stringValue = shareURL
        sendButton.title = "Done"
        sendButton.isEnabled = false
    }

    private func prepareSharedFile() async {
        do {
            guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
                  let attachments = extensionItem.attachments,
                  !attachments.isEmpty else {
                throw ShareError("No file was provided to the share extension.")
            }

            let file = try await loadSharedFile(from: attachments)
            sharedFile = file
            renderReady(file: file)
        } catch {
            renderError(error.localizedDescription)
        }
    }

    @objc
    private func send(_ sender: Any?) {
        guard !isUploading else {
            return
        }

        guard let sharedFile else {
            renderError("No file is available to upload.")
            return
        }

        let displayName = displayNameField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !displayName.isEmpty else {
            renderError("Enter the file name you want people to see.")
            return
        }

        renderUploading()

        Task {
            do {
                let shareURL = try await upload(sharedFile: sharedFile, displayName: displayName)
                copyToClipboard(shareURL)
                renderSuccess(shareURL)
                try await Task.sleep(nanoseconds: 700_000_000)
                extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            } catch {
                renderError(error.localizedDescription)
            }
        }
    }

    @objc
    private func cancel(_ sender: Any?) {
        let cancelError = NSError(domain: NSCocoaErrorDomain, code: NSUserCancelledError, userInfo: nil)
        extensionContext?.cancelRequest(withError: cancelError)
    }

    private func copyToClipboard(_ value: String) {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(value, forType: .string)
    }

    private func loadSharedFile(from attachments: [NSItemProvider]) async throws -> SharedFile {
        var lastError: Error?

        for provider in attachments {
            for identifier in provider.registeredTypeIdentifiers {
                do {
                    if let file = try await loadFileRepresentation(from: provider, typeIdentifier: identifier) {
                        return file
                    }
                } catch {
                    lastError = error
                }
            }

            if provider.hasItemConformingToTypeIdentifier(UTType.item.identifier) {
                do {
                    if let file = try await loadFileRepresentation(from: provider, typeIdentifier: UTType.item.identifier) {
                        return file
                    }
                } catch {
                    lastError = error
                }
            }

            if provider.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
                do {
                    if let file = try await loadFileURL(from: provider) {
                        return file
                    }
                } catch {
                    lastError = error
                }
            }
        }

        if let lastError {
            throw ShareError("Could not read the shared file: \(lastError.localizedDescription)")
        }

        throw ShareError("This share extension currently supports files from disk.")
    }

    private func loadFileURL(from provider: NSItemProvider) async throws -> SharedFile? {
        try await withCheckedThrowingContinuation { continuation in
            provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { item, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                do {
                    if let url = item as? URL {
                        continuation.resume(returning: try self.makeSharedFile(from: url))
                        return
                    }

                    if let data = item as? Data,
                       let url = NSURL(absoluteURLWithDataRepresentation: data, relativeTo: nil) as URL? {
                        continuation.resume(returning: try self.makeSharedFile(from: url))
                        return
                    }

                    if let string = item as? String,
                       let url = URL(string: string),
                       url.isFileURL {
                        continuation.resume(returning: try self.makeSharedFile(from: url))
                        return
                    }

                    continuation.resume(returning: nil)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    private func loadFileRepresentation(from provider: NSItemProvider, typeIdentifier: String) async throws -> SharedFile? {
        try await withCheckedThrowingContinuation { continuation in
            provider.loadFileRepresentation(forTypeIdentifier: typeIdentifier) { url, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                guard let url else {
                    continuation.resume(returning: nil)
                    return
                }

                do {
                    let file = try self.makePersistentSharedFile(fromTemporaryURL: url)
                    continuation.resume(returning: file)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    nonisolated private func makeSharedFile(from url: URL) throws -> SharedFile {
        let fileName = url.lastPathComponent.isEmpty ? "Untitled file" : url.lastPathComponent
        let contentType = contentTypeForFile(at: url)
        return SharedFile(url: url, suggestedName: fileName, contentType: contentType)
    }

    nonisolated private func makePersistentSharedFile(fromTemporaryURL temporaryURL: URL) throws -> SharedFile {
        let tempDirectory = FileManager.default.temporaryDirectory.appendingPathComponent("share-extension", isDirectory: true)
        try FileManager.default.createDirectory(at: tempDirectory, withIntermediateDirectories: true, attributes: nil)

        let destinationURL = uniqueTemporaryURL(in: tempDirectory, suggestedName: temporaryURL.lastPathComponent)
        if FileManager.default.fileExists(atPath: destinationURL.path) {
            try FileManager.default.removeItem(at: destinationURL)
        }

        try FileManager.default.copyItem(at: temporaryURL, to: destinationURL)
        return try makeSharedFile(from: destinationURL)
    }

    nonisolated private func uniqueTemporaryURL(in directory: URL, suggestedName: String) -> URL {
        let cleanName = suggestedName.isEmpty ? "shared-file" : suggestedName
        return directory.appendingPathComponent("\(UUID().uuidString)-\(cleanName)")
    }

    nonisolated private func contentTypeForFile(at url: URL) -> String {
        if let values = try? url.resourceValues(forKeys: [.contentTypeKey]),
           let type = values.contentType {
            return type.preferredMIMEType ?? "application/octet-stream"
        }

        if let type = UTType(filenameExtension: url.pathExtension) {
            return type.preferredMIMEType ?? "application/octet-stream"
        }

        return "application/octet-stream"
    }

    nonisolated private func upload(sharedFile: SharedFile, displayName: String) async throws -> String {
        let endpointURL = try desktopSharesEndpointURL()
        let boundary = "Boundary-\(UUID().uuidString)"
        let bodyURL = try createMultipartBodyFile(sharedFile: sharedFile, displayName: displayName, boundary: boundary)
        defer { try? FileManager.default.removeItem(at: bodyURL) }

        var request = URLRequest(url: endpointURL)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 60 * 10

        let (data, response) = try await URLSession.shared.upload(for: request, fromFile: bodyURL)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ShareError("Upload failed before the server returned a response.")
        }

        if httpResponse.statusCode < 200 || httpResponse.statusCode >= 300 {
            let message = (try? JSONDecoder().decode(ServerErrorResponse.self, from: data).error) ?? "Upload failed. Try again in a moment."
            throw ShareError(message)
        }

        let payload = try JSONDecoder().decode(UploadResponse.self, from: data)
        return payload.shareUrl
    }

    nonisolated private func serverBaseURL() throws -> URL {
        if let override = ProcessInfo.processInfo.environment["OPENDRIVE_SERVER_URL"]?.trimmingCharacters(in: .whitespacesAndNewlines),
           !override.isEmpty,
           let url = URL(string: override),
           url.scheme != nil,
           url.host != nil {
            return url
        }

        if let configured = Bundle.main.object(forInfoDictionaryKey: "OpenDriveServerURL") as? String,
           let url = URL(string: configured),
           url.scheme != nil,
           url.host != nil {
            return url
        }

        throw ShareError("Missing OpenDriveServerURL in the share extension configuration.")
    }

    nonisolated private func desktopSharesEndpointURL() throws -> URL {
        guard let url = URL(string: "/api/v1/desktop/shares", relativeTo: try serverBaseURL())?.absoluteURL else {
            throw ShareError("Could not construct the desktop share upload URL.")
        }

        return url
    }

    nonisolated private func createMultipartBodyFile(sharedFile: SharedFile, displayName: String, boundary: String) throws -> URL {
        let bodyURL = FileManager.default.temporaryDirectory.appendingPathComponent("\(UUID().uuidString).multipart")
        FileManager.default.createFile(atPath: bodyURL.path, contents: nil)

        guard let handle = try? FileHandle(forWritingTo: bodyURL) else {
            throw ShareError("Could not prepare the upload body.")
        }

        defer { try? handle.close() }

        try handle.write(contentsOf: Data("--\(boundary)\r\n".utf8))
        try handle.write(contentsOf: Data("Content-Disposition: form-data; name=\"name\"\r\n\r\n".utf8))
        try handle.write(contentsOf: Data(displayName.utf8))
        try handle.write(contentsOf: Data("\r\n".utf8))

        let escapedFileName = sharedFile.url.lastPathComponent
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")

        try handle.write(contentsOf: Data("--\(boundary)\r\n".utf8))
        try handle.write(contentsOf: Data("Content-Disposition: form-data; name=\"file\"; filename=\"\(escapedFileName)\"\r\n".utf8))
        try handle.write(contentsOf: Data("Content-Type: \(sharedFile.contentType)\r\n\r\n".utf8))

        let sourceHandle = try FileHandle(forReadingFrom: sharedFile.url)
        defer { try? sourceHandle.close() }

        while true {
            let chunk = try sourceHandle.read(upToCount: 64 * 1024) ?? Data()
            if chunk.isEmpty {
                break
            }

            try handle.write(contentsOf: chunk)
        }

        try handle.write(contentsOf: Data("\r\n--\(boundary)--\r\n".utf8))
        return bodyURL
    }
}

private struct ServerErrorResponse: Decodable {
    let error: String
}

private struct ShareError: LocalizedError {
    let message: String

    init(_ message: String) {
        self.message = message
    }

    var errorDescription: String? {
        message
    }
}
