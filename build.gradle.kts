import net.ltgt.gradle.errorprone.errorprone

plugins {
	java
	id("org.springframework.boot") version "4.0.4"
	id("io.spring.dependency-management") version "1.1.7"
	id("io.spring.nullability") version "0.0.12"
	id("org.graalvm.buildtools.native") version "0.11.5"
	id("gg.jte.gradle") version "3.2.3"
	id("com.diffplug.spotless") version "8.4.0"
    id("pl.allegro.tech.build.axion-release") version "1.21.1"
}

group = "io.github.gadnex"
version = scmVersion.version

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

val springModulithVersion by extra("2.0.4")
val jmoleculesVersion by extra("2025.0.2")
val jteVersion by extra("3.2.3")

dependencyManagement {
    imports {
        mavenBom("org.springframework.modulith:spring-modulith-bom:$springModulithVersion")
        mavenBom("org.jmolecules:jmolecules-bom:$jmoleculesVersion")
    }
}

dependencies {
	// Spring Web MVC
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")

	// Validation
	implementation("org.springframework.boot:spring-boot-starter-validation")
	testImplementation("org.springframework.boot:spring-boot-starter-validation-test")

	// Spring Modulith
    implementation("org.springframework.modulith:spring-modulith-starter-core")
    implementation("org.jmolecules:jmolecules-onion-architecture")
    testImplementation("org.springframework.modulith:spring-modulith-starter-test")
    testImplementation("org.jmolecules.integrations:jmolecules-archunit")

	// Actuator
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	testImplementation("org.springframework.boot:spring-boot-starter-actuator-test")

	// DevTools
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	
	// JTE
    implementation("gg.jte:jte-spring-boot-starter-4:$jteVersion")
    jteGenerate("gg.jte:jte-native-resources:$jteVersion")

    // JUnit
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

jte {
    generate()
    binaryStaticContent = true
    jteExtension("gg.jte.nativeimage.NativeResourcesExtension")
}

tasks.withType<JavaCompile>().configureEach {
    options.errorprone {
        // Exclude JTE generated classes from @NullMarked checks
        excludedPaths = ".*/build/generated-sources/jte/.*"
    }
}

tasks.test {
    useJUnitPlatform()
    
    // Fix for the Mockito self-attachment warning
    val mockitoAgent = configurations.testRuntimeClasspath.get()
        .find { it.name.contains("mockito-core") }
    if (mockitoAgent != null) {
        jvmArgs("-javaagent:$mockitoAgent", "-Xshare:off")
    }
}

tasks.bootBuildImage {
    imageName.set("gadnex/${rootProject.name}:${project.version}")
    environment.put("BP_JVM_VERSION", "25")
    environment.put("BP_NATIVE_IMAGE_BUILD_ARGUMENTS", "-march=compatibility")
}

spotless {
    java {
        googleJavaFormat()
        target("src/*/java/**/*.java")
    }
}