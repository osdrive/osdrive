//
//  ContentView.swift
//  desktop
//
//  Created by Oscar Beaumont on 5/4/2026.
//

import FileProvider
import SwiftUI

private enum DemoFileProviderDomain {
    static let identifier = NSFileProviderDomainIdentifier("hello-world")
    static let displayName = "Hello World"
}

struct ContentView: View {
    @State private var status = "Checking File Provider domain registration..."

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Hello World File Provider")
                .font(.title2)

            Text(status)
                .foregroundStyle(.secondary)

            HStack {
                Button("Register with macOS") {
                    registerDomain()
                }

                Button("Remove Domain") {
                    removeDomain()
                }
            }
        }
        .padding()
        .frame(minWidth: 420)
        .task {
            await refreshStatus()
            registerDomain()
        }
    }

    private func registerDomain() {
        let domain = NSFileProviderDomain(
            identifier: DemoFileProviderDomain.identifier,
            displayName: DemoFileProviderDomain.displayName
        )

        NSFileProviderManager.add(domain) { error in
            Task { @MainActor in
                if let error {
                    status = "Registration failed: \(error.localizedDescription)"
                } else {
                    await refreshStatus()
                }
            }
        }
    }

    private func removeDomain() {
        let domain = NSFileProviderDomain(
            identifier: DemoFileProviderDomain.identifier,
            displayName: DemoFileProviderDomain.displayName
        )

        NSFileProviderManager.remove(domain) { error in
            Task { @MainActor in
                if let error {
                    status = "Removal failed: \(error.localizedDescription)"
                } else {
                    await refreshStatus()
                }
            }
        }
    }

    @MainActor
    private func refreshStatus() async {
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            NSFileProviderManager.getDomainsWithCompletionHandler { domains, error in
                defer { continuation.resume() }

                if let error {
                    status = "Unable to read domains: \(error.localizedDescription)"
                    return
                }

                let isRegistered = domains.contains { $0.identifier == DemoFileProviderDomain.identifier }
                status = isRegistered
                    ? "Registered. Open Finder and look for “\(DemoFileProviderDomain.displayName)” in the sidebar."
                    : "Not registered. Click Register with macOS to create the Finder sidebar entry."
            }
        }
    }
}

#Preview {
    ContentView()
}
