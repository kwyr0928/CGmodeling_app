/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! cannon-es */ "./node_modules/cannon-es/dist/cannon-es.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
// 22FI038 川瀬友里



class ThreeJSContainer {
    scene;
    light;
    wallNum;
    planeBody;
    stopBody;
    goalBody;
    goalMesh;
    cloud;
    particleVelocity;
    isColliding = false;
    collisionCooldown = 500;
    goalMoveSpeed = 0.5;
    count = 0;
    moveGoal(dx) {
        const newX = this.goalBody.position.x + dx;
        if (newX > -10 && newX < 10) { // 画面の端を-6から6と仮定
            this.goalBody.position.x = newX;
            this.goalMesh.position.x = newX;
        }
    }
    constructor() { }
    // 画面部分の作成(表示する枠ごとに)*
    createRendererDOM = (width, height, cameraPos) => {
        const renderer = new three__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_1__.Color(0x9BE5DE));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする
        //カメラの設定
        const camera = new three__WEBPACK_IMPORTED_MODULE_1__.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 0));
        const orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__.OrbitControls(camera, renderer.domElement);
        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render = (time) => {
            orbitControls.update();
            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    };
    // シーンの作成(全体で1回)
    createScene = () => {
        this.scene = new three__WEBPACK_IMPORTED_MODULE_1__.Scene();
        let createParticles = () => {
            //ジオメトリの作成
            const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BufferGeometry();
            //マテリアルの作成
            const textureLoader = new three__WEBPACK_IMPORTED_MODULE_1__.TextureLoader();
            const texture = textureLoader.load("raindrop.png");
            const material = new three__WEBPACK_IMPORTED_MODULE_1__.PointsMaterial({
                size: 1,
                map: texture,
                blending: three__WEBPACK_IMPORTED_MODULE_1__.AdditiveBlending,
                color: 0xffffff,
                depthWrite: false,
                transparent: true,
                opacity: 0.5,
            });
            //particleの作成
            const particleNum = 100; // パーティクルの数
            const positions = new Float32Array(particleNum * 3);
            let particleIndex = 0;
            this.particleVelocity = [];
            for (let i = 0; i < particleNum; i++) {
                positions[particleIndex++] = Math.random() * 30 - 15; // x座標
                positions[particleIndex++] = Math.random() * 30; // y座標
                positions[particleIndex++] = Math.random() * 30 - 15; // z座標
                this.particleVelocity.push(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, -0.3 * Math.random() - 0.05, 0));
            }
            geometry.setAttribute("position", new three__WEBPACK_IMPORTED_MODULE_1__.BufferAttribute(positions, 3));
            //THREE.Pointsの作成
            this.cloud = new three__WEBPACK_IMPORTED_MODULE_1__.Points(geometry, material);
            //シーンへの追加
            this.scene.add(this.cloud);
        };
        createParticles();
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.moveGoal(-this.goalMoveSpeed);
                    break;
                case 'ArrowRight':
                    this.moveGoal(this.goalMoveSpeed);
                    break;
            }
        });
        // 物理空間の設定
        const world = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.World({
            gravity: new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(0, -9.82, 0),
        });
        world.defaultContactMaterial.friction = 0.0;
        world.defaultContactMaterial.restitution = 0.0;
        // let cubeBodys: CANNON.Body[] = [];
        // // 物理空間 Boxの作成
        // this.cubeNum = 50;
        // for(let i=0; i<this.cubeNum; i++){
        // const cubeShape = new CANNON.Box(new CANNON.Vec3(0.35, 0.5, 0.1));
        // const cubeMaterial = new CANNON.Material({ friction: 0.02, restitution: 0.0 });
        // cubeBodys[i] = new CANNON.Body({ mass: 1 , material: cubeMaterial });
        // cubeBodys[i].addShape(cubeShape);
        // }
        let wallBodys = [];
        // 物理空間 壁の作成
        this.wallNum = 9;
        for (let i = 0; i < this.wallNum; i++) {
            const wallShapes = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(0.35, 0.5, 0.1));
            wallBodys[i] = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
            wallBodys[i].addShape(wallShapes);
        }
        // 物理空間 止まる壁の作成
        const stopShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(10, 1.5, 0.3));
        this.stopBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
        this.stopBody.addShape(stopShape);
        // 物理空間 ゴールの作成
        const goalShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(1, 1.5, 0.3));
        this.goalBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
        this.goalBody.addShape(goalShape);
        // 物理空間 Planeの作成
        const planeShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Plane();
        this.planeBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
        this.planeBody.addShape(planeShape);
        // 物理空間 ボールの作成
        const ballShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Sphere(0.4);
        const ballBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 1 });
        ballBody.addShape(ballShape);
        // Boxの作成
        const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(0.7, 1, 0.2);
        const material = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0xE59BDA });
        // for(let i=0; i<this.cubeNum; i++){
        //     const radius = 6;
        //     const theta = Math.PI * 2 * i / this.cubeNum;
        //     const circleX = radius * Math.cos(theta);
        //     const circleZ = radius * Math.sin(theta);
        // cubes[i] = new THREE.Mesh(geometry, material);
        // cubes[i].position.x = circleX;
        // cubes[i].position.y = 5;
        // cubes[i].position.z = circleZ;
        // cubes[i].rotation.y = - Math.PI * 2 * i / this.cubeNum;
        // if(i === 0){
        // cubes[i].rotation.x = 0.5;
        // }
        // this.scene.add(cubes[i]);
        // }
        let wallMeshs = [];
        // 壁の作成
        for (let i = 0; i < this.wallNum; i++) {
            wallMeshs[i] = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(geometry, material);
            wallMeshs[i].position.y = 2;
            wallMeshs[i].position.x = 2 * i - 8;
            wallMeshs[i].rotation.x = Math.PI / 2 - 40;
            this.scene.add(wallMeshs[i]);
        }
        // 止まる壁の作成
        const stopGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(20, 3, 0.6);
        const stopMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0xE59BDA });
        const stopMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(stopGeometry, stopMaterial);
        stopMesh.position.z = 10;
        this.scene.add(stopMesh);
        // ゴールの作成
        const goalGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(2, 3, 0.6);
        const goalMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshPhongMaterial({ color: 0xd2b48c });
        this.goalMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(goalGeometry, goalMaterial);
        this.goalMesh.position.z = 8;
        this.scene.add(this.goalMesh);
        // Planeの作成
        const phongMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0xE5DE9B });
        const planeGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.PlaneGeometry(25, 25);
        const planeMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(planeGeometry, phongMaterial);
        planeMesh.material.side = three__WEBPACK_IMPORTED_MODULE_1__.DoubleSide; // 両面
        planeMesh.rotateX(-Math.PI / 2);
        this.scene.add(planeMesh);
        // ボールの作成
        const ballGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.SphereGeometry(0.4, 32, 16);
        const ballMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshNormalMaterial();
        const sphere = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(ballGeometry, ballMaterial);
        sphere.position.y = 4;
        this.scene.add(sphere);
        // Box 紐づけ
        // for(let i=0; i<this.cubeNum; i++){
        // cubeBodys[i].position.set(cubes[i].position.x, cubes[i].position.y, cubes[i].position.z);
        // cubeBodys[i].quaternion.set(cubes[i].quaternion.x, cubes[i].quaternion.y, cubes[i].quaternion.z, cubes[i].quaternion.w);
        // }
        for (let i = 0; i < this.wallNum; i++) {
            // 壁 紐づけ
            wallBodys[i].position.set(wallMeshs[i].position.x, wallMeshs[i].position.y, wallMeshs[i].position.z);
            wallBodys[i].quaternion.set(wallMeshs[i].quaternion.x, wallMeshs[i].quaternion.y, wallMeshs[i].quaternion.z, wallMeshs[i].quaternion.w);
        }
        // 止まる壁 紐づけ
        this.stopBody.position.set(stopMesh.position.x, stopMesh.position.y, stopMesh.position.z);
        this.stopBody.quaternion.set(stopMesh.quaternion.x, stopMesh.quaternion.y, stopMesh.quaternion.z, stopMesh.quaternion.w);
        // ゴール 紐づけ
        this.goalBody.position.set(this.goalMesh.position.x, this.goalMesh.position.y, this.goalMesh.position.z);
        this.goalBody.quaternion.set(this.goalMesh.quaternion.x, this.goalMesh.quaternion.y, this.goalMesh.quaternion.z, this.goalMesh.quaternion.w);
        // plane 紐づけ
        this.planeBody.position.set(planeMesh.position.x, planeMesh.position.y, planeMesh.position.z);
        this.planeBody.quaternion.set(planeMesh.quaternion.x, planeMesh.quaternion.y, planeMesh.quaternion.z, planeMesh.quaternion.w);
        // ボール 紐づけ
        ballBody.position.set(sphere.position.x, sphere.position.y, sphere.position.z);
        ballBody.quaternion.set(sphere.quaternion.x, sphere.quaternion.y, sphere.quaternion.z, sphere.quaternion.w);
        // 追加
        world.addBody(this.planeBody);
        // for(let i=0; i<this.cubeNum; i++){
        // world.addBody(cubeBodys[i]);
        // }
        for (let i = 0; i < this.wallNum; i++) {
            world.addBody(wallBodys[i]);
        }
        world.addBody(ballBody);
        world.addBody(this.stopBody);
        world.addBody(this.goalBody);
        // // グリッド表示
        // const gridHelper = new THREE.GridHelper(10);
        // this.scene.add(gridHelper);
        // // 軸表示
        // const axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
        //ライトの設定
        this.light = new three__WEBPACK_IMPORTED_MODULE_1__.DirectionalLight(0xffffff);
        const lvec = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(1, 1, 1).clone().normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
        const clock = new three__WEBPACK_IMPORTED_MODULE_1__.Clock();
        let update = (time) => {
            const deltaTime = clock.getDelta();
            // 座標の更新
            world.fixedStep();
            // for(let i=0; i<this.cubeNum; i++){
            // cubes[i].position.set(cubeBodys[i].position.x, cubeBodys[i].position.y, cubeBodys[i].position.z);
            // cubes[i].quaternion.set(cubeBodys[i].quaternion.x, cubeBodys[i].quaternion.y, cubeBodys[i].quaternion.z, cubeBodys[i].quaternion.w);
            // }
            sphere.position.set(ballBody.position.x, ballBody.position.y, ballBody.position.z);
            sphere.quaternion.set(ballBody.quaternion.x, ballBody.quaternion.y, ballBody.quaternion.z, ballBody.quaternion.w);
            this.goalMesh.position.set(this.goalBody.position.x, this.goalBody.position.y, this.goalBody.position.z);
            this.goalMesh.quaternion.set(this.goalBody.quaternion.x, this.goalBody.quaternion.y, this.goalBody.quaternion.z, this.goalBody.quaternion.w);
            ballBody.addEventListener("collide", (e) => {
                // 衝突相手のボディを取得
                const collidedBody = e.contact.bi.id === ballBody.id
                    ? e.contact.bj
                    : e.contact.bi;
                // planeBodyとの衝突時のみ処理を実行
                if (collidedBody.id === this.stopBody.id || collidedBody.id === this.goalBody.id) {
                    const random = Math.floor(Math.random() * 9) * 2 - 8;
                    sphere.position.z = 0;
                    sphere.position.x = random;
                    sphere.position.y = 4;
                    ballBody.position.x = random;
                    ballBody.position.z = 0;
                    ballBody.position.y = 4;
                    ballBody.velocity.set(0, -5, 0); // 速度をリセット
                    ballBody.angularVelocity.set(0, 0, 0); // 角速度をリセット
                    if (e.body === this.goalBody && !this.isColliding) {
                        this.count++;
                        this.isColliding = true;
                        console.log(this.count);
                        setTimeout(() => {
                            this.isColliding = false;
                        }, this.collisionCooldown);
                    }
                }
            });
            const geom = this.cloud.geometry;
            const positions = geom.getAttribute("position"); // 座標データ
            for (let i = 0; i < this.particleVelocity.length; i++) {
                positions.setX(i, positions.getX(i) + this.particleVelocity[i].x * 100 * deltaTime);
                if (positions.getY(i) + this.particleVelocity[i].y < 0) {
                    positions.setY(i, 20);
                }
                else {
                    positions.setY(i, positions.getY(i) + this.particleVelocity[i].y * 100 * deltaTime);
                }
                positions.setZ(i, positions.getZ(i) + this.particleVelocity[i].z * 100 * deltaTime);
            }
            positions.needsUpdate = true;
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
}
window.addEventListener("DOMContentLoaded", init);
function init() {
    let container = new ThreeJSContainer();
    let viewport = container.createRendererDOM(640, 480, new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(10, 10, 10));
    document.body.appendChild(viewport);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_cannon-es_dist_cannon-es_js-node_modules_three_examples_jsm_controls_Orb-e58bd2"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSx1Q0FBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsVUFBVTtRQUNWLE1BQU0sWUFBWSxHQUFHLElBQUksOENBQWlCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2RCxNQUFNLFlBQVksR0FBRyxJQUFJLG9EQUF1QixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdEUsTUFBTSxRQUFRLEdBQUcsSUFBSSx1Q0FBVSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM1RCxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFekIsU0FBUztRQUNULE1BQU0sWUFBWSxHQUFHLElBQUksOENBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RCxNQUFNLFlBQVksR0FBRyxJQUFJLG9EQUF1QixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHVDQUFVLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRzlCLFdBQVc7UUFDWCxNQUFNLGFBQWEsR0FBRyxJQUFJLG9EQUF1QixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkUsTUFBTSxhQUFhLEdBQUcsSUFBSSxnREFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEQsTUFBTSxTQUFTLEdBQUcsSUFBSSx1Q0FBVSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvRCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyw2Q0FBZ0IsQ0FBQyxDQUFDLEtBQUs7UUFDakQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFMUIsU0FBUztRQUNULE1BQU0sWUFBWSxHQUFHLElBQUksaURBQW9CLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRCxNQUFNLFlBQVksR0FBRyxJQUFJLHFEQUF3QixFQUFFLENBQUM7UUFDcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSx1Q0FBVSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdkIsVUFBVTtRQUNWLHFDQUFxQztRQUNyQyw0RkFBNEY7UUFDNUYsMkhBQTJIO1FBQzNILElBQUk7UUFFSixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuQyxRQUFRO1lBQ1IsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3JCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUN2QixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDdkIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQzFCLENBQUM7WUFDRixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDdkIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQ3pCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUN6QixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDekIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQzVCLENBQUM7U0FDTDtRQUVELFdBQVc7UUFDWCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3RCLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUNuQixRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDbkIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQ3RCLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQ3hCLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUNyQixRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDckIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQ3JCLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUN4QixDQUFDO1FBRUQsVUFBVTtRQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FDM0IsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUM3QixDQUFDO1FBRUYsWUFBWTtRQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDdkIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQ3BCLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUNwQixTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FDdkIsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDekIsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQ3RCLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUN0QixTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDdEIsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFFRixVQUFVO1FBQ1YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUNqQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDakIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQ3BCLENBQUM7UUFDRixRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDbkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQ25CLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUNuQixNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDbkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQ3RCLENBQUM7UUFFRixLQUFLO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUIscUNBQXFDO1FBQ3JDLCtCQUErQjtRQUMvQixJQUFJO1FBQ0osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbkMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFN0IsWUFBWTtRQUNaLCtDQUErQztRQUMvQyw4QkFBOEI7UUFFOUIsU0FBUztRQUNULDhDQUE4QztRQUM5Qyw4QkFBOEI7UUFFOUIsUUFBUTtRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxtREFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxNQUFNLElBQUksR0FBRyxJQUFJLDBDQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNwRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSx3Q0FBVyxFQUFFLENBQUM7UUFDaEMsSUFBSSxNQUFNLEdBQXlCLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDNUMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQy9CLFFBQVE7WUFDUixLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbEIscUNBQXFDO1lBQ3JDLG9HQUFvRztZQUNwRyx1SUFBdUk7WUFDdkksSUFBSTtZQUVKLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUNuQixRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDbkIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQ3RCLENBQUM7WUFDRixNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDakIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQ3JCLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUNyQixRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDckIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQ3hCLENBQUM7WUFFRixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQzNCLENBQUM7WUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FDN0IsQ0FBQztZQUdGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDdkMsY0FBYztnQkFDZCxNQUFNLFlBQVksR0FDZCxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUU7b0JBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUV2Qix3QkFBd0I7Z0JBQ3hCLElBQUksWUFBWSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFHO29CQUMvRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNyRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztvQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN0QixRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7b0JBQzdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDeEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVO29CQUMzQyxRQUFRLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVztvQkFDbEQsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNuRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ2IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN4QixVQUFVLENBQUMsR0FBRyxFQUFFOzRCQUNaLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO3dCQUM3QixDQUFDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7cUJBQzlCO2lCQUNBO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLElBQUksR0FBeUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7WUFDdkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVE7WUFDekQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ25ELFNBQVMsQ0FBQyxJQUFJLENBQ1YsQ0FBQyxFQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUNuRSxDQUFDO2dCQUNGLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDcEQsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3pCO3FCQUFNO29CQUNILFNBQVMsQ0FBQyxJQUFJLENBQ1YsQ0FBQyxFQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUNuRSxDQUFDO2lCQUNMO2dCQUNELFNBQVMsQ0FBQyxJQUFJLENBQ1YsQ0FBQyxFQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUNuRSxDQUFDO2FBQ0w7WUFFRCxTQUFTLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUU3QixxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUM7UUFDRixxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUM7Q0FDTDtBQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUVsRCxTQUFTLElBQUk7SUFDVCxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7SUFFdkMsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUN0QyxHQUFHLEVBQ0gsR0FBRyxFQUNILElBQUksMENBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUNoQyxDQUFDO0lBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEMsQ0FBQzs7Ozs7OztVQ3BiRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOztVQUVBO1VBQ0E7Ozs7O1dDekJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsK0JBQStCLHdDQUF3QztXQUN2RTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlCQUFpQixxQkFBcUI7V0FDdEM7V0FDQTtXQUNBLGtCQUFrQixxQkFBcUI7V0FDdkM7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2NncHJlbmRlcmluZy8uL3NyYy9hcHAudHMiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyAyMkZJMDM4IOW3neeArOWPi+mHjFxuXG5pbXBvcnQgKiBhcyBDQU5OT04gZnJvbSBcImNhbm5vbi1lc1wiO1xuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgeyBPcmJpdENvbnRyb2xzIH0gZnJvbSBcInRocmVlL2V4YW1wbGVzL2pzbS9jb250cm9scy9PcmJpdENvbnRyb2xzXCI7XG5cbmNsYXNzIFRocmVlSlNDb250YWluZXIge1xuICAgIHByaXZhdGUgc2NlbmU6IFRIUkVFLlNjZW5lO1xuICAgIHByaXZhdGUgbGlnaHQ6IFRIUkVFLkxpZ2h0O1xuICAgIHByaXZhdGUgd2FsbE51bTogbnVtYmVyO1xuICAgIHByaXZhdGUgcGxhbmVCb2R5OiBDQU5OT04uQm9keTtcbiAgICBwcml2YXRlIHN0b3BCb2R5OiBDQU5OT04uQm9keTtcbiAgICBwcml2YXRlIGdvYWxCb2R5OiBDQU5OT04uQm9keTtcbiAgICBwcml2YXRlIGdvYWxNZXNoOiBUSFJFRS5NZXNoO1xuICAgIHByaXZhdGUgY2xvdWQ6IFRIUkVFLlBvaW50cztcbiAgICBwcml2YXRlIHBhcnRpY2xlVmVsb2NpdHk6IFRIUkVFLlZlY3RvcjNbXTtcbiAgICBwcml2YXRlIGlzQ29sbGlkaW5nOiBib29sZWFuID0gZmFsc2U7XG5wcml2YXRlIGNvbGxpc2lvbkNvb2xkb3duOiBudW1iZXIgPSA1MDA7XG4gICAgcHJpdmF0ZSBnb2FsTW92ZVNwZWVkOiBudW1iZXIgPSAwLjU7XG4gICAgcHJpdmF0ZSBjb3VudDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgbW92ZUdvYWwoZHg6IG51bWJlcikge1xuICAgICAgICBjb25zdCBuZXdYID0gdGhpcy5nb2FsQm9keS5wb3NpdGlvbi54ICsgZHg7XG4gICAgICAgIGlmIChuZXdYID4gLTEwICYmIG5ld1ggPCAxMCkgeyAgLy8g55S76Z2i44Gu56uv44KSLTbjgYvjgok244Go5Luu5a6aXG4gICAgICAgICAgICB0aGlzLmdvYWxCb2R5LnBvc2l0aW9uLnggPSBuZXdYO1xuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5wb3NpdGlvbi54ID0gbmV3WDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIC8vIOeUu+mdoumDqOWIhuOBruS9nOaIkCjooajnpLrjgZnjgovmnqDjgZTjgajjgaspKlxuICAgIHB1YmxpYyBjcmVhdGVSZW5kZXJlckRPTSA9IChcbiAgICAgICAgd2lkdGg6IG51bWJlcixcbiAgICAgICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgICAgIGNhbWVyYVBvczogVEhSRUUuVmVjdG9yM1xuICAgICkgPT4ge1xuICAgICAgICBjb25zdCByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gICAgICAgIHJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IobmV3IFRIUkVFLkNvbG9yKDB4OUJFNURFKSk7XG4gICAgICAgIHJlbmRlcmVyLnNoYWRvd01hcC5lbmFibGVkID0gdHJ1ZTsgLy/jgrfjg6Pjg4njgqbjg57jg4Pjg5fjgpLmnInlirnjgavjgZnjgotcblxuICAgICAgICAvL+OCq+ODoeODqeOBruioreWumlxuICAgICAgICBjb25zdCBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgICAgICAgICA3NSxcbiAgICAgICAgICAgIHdpZHRoIC8gaGVpZ2h0LFxuICAgICAgICAgICAgMC4xLFxuICAgICAgICAgICAgMTAwMFxuICAgICAgICApO1xuICAgICAgICBjYW1lcmEucG9zaXRpb24uY29weShjYW1lcmFQb3MpO1xuICAgICAgICBjYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcblxuICAgICAgICBjb25zdCBvcmJpdENvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHMoY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50KTtcblxuICAgICAgICB0aGlzLmNyZWF0ZVNjZW5lKCk7XG4gICAgICAgIC8vIOavjuODleODrOODvOODoOOBrnVwZGF0ZeOCkuWRvOOCk+OBp++8jHJlbmRlclxuICAgICAgICAvLyByZXFlc3RBbmltYXRpb25GcmFtZSDjgavjgojjgormrKHjg5Xjg6zjg7zjg6DjgpLlkbzjgbZcbiAgICAgICAgY29uc3QgcmVuZGVyOiBGcmFtZVJlcXVlc3RDYWxsYmFjayA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICBvcmJpdENvbnRyb2xzLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgY2FtZXJhKTtcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxuICAgICAgICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLmNzc0Zsb2F0ID0gXCJsZWZ0XCI7XG4gICAgICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubWFyZ2luID0gXCIxMHB4XCI7XG4gICAgICAgIHJldHVybiByZW5kZXJlci5kb21FbGVtZW50O1xuICAgIH07XG5cbiAgICAvLyDjgrfjg7zjg7Pjga7kvZzmiJAo5YWo5L2T44GnMeWbnilcbiAgICBwcml2YXRlIGNyZWF0ZVNjZW5lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgICAgICAgbGV0IGNyZWF0ZVBhcnRpY2xlcyA9ICgpID0+IHtcbiAgICAgICAgICAgIC8v44K444Kq44Oh44OI44Oq44Gu5L2c5oiQXG4gICAgICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICAgICAgICAgICAgLy/jg57jg4bjg6rjgqLjg6vjga7kvZzmiJBcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IHRleHR1cmVMb2FkZXIubG9hZChcInJhaW5kcm9wLnBuZ1wiKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50c01hdGVyaWFsKHtcbiAgICAgICAgICAgICAgICBzaXplOiAxLFxuICAgICAgICAgICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgICAgICAgICBjb2xvcjogMHhmZmZmZmYsXG4gICAgICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL3BhcnRpY2xl44Gu5L2c5oiQXG4gICAgICAgICAgICBjb25zdCBwYXJ0aWNsZU51bSA9IDEwMDsgLy8g44OR44O844OG44Kj44Kv44Or44Gu5pWwXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlTnVtICogMyk7XG4gICAgICAgICAgICBsZXQgcGFydGljbGVJbmRleCA9IDA7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlVmVsb2NpdHkgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydGljbGVOdW07IGkrKykge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uc1twYXJ0aWNsZUluZGV4KytdID0gTWF0aC5yYW5kb20oKSAqIDMwIC0gMTU7IC8vIHjluqfmqJlcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnNbcGFydGljbGVJbmRleCsrXSA9IE1hdGgucmFuZG9tKCkgKiAzMDsgLy8geeW6p+aomVxuICAgICAgICAgICAgICAgIHBvc2l0aW9uc1twYXJ0aWNsZUluZGV4KytdID0gTWF0aC5yYW5kb20oKSAqIDMwIC0gMTU7IC8vIHrluqfmqJlcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlVmVsb2NpdHkucHVzaChcbiAgICAgICAgICAgICAgICAgICAgbmV3IFRIUkVFLlZlY3RvcjMoMCwgLTAuMyAqIE1hdGgucmFuZG9tKCkgLSAwLjA1LCAwKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdlb21ldHJ5LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICBcInBvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy9USFJFRS5Qb2ludHPjga7kvZzmiJBcbiAgICAgICAgICAgIHRoaXMuY2xvdWQgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgICAgICAvL+OCt+ODvOODs+OBuOOBrui/veWKoFxuICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5jbG91ZCk7XG4gICAgICAgIH07XG4gICAgICAgIGNyZWF0ZVBhcnRpY2xlcygpO1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlR29hbCgtdGhpcy5nb2FsTW92ZVNwZWVkKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUdvYWwodGhpcy5nb2FsTW92ZVNwZWVkKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOeJqeeQhuepuumWk+OBruioreWumlxuICAgICAgICBjb25zdCB3b3JsZCA9IG5ldyBDQU5OT04uV29ybGQoe1xuICAgICAgICAgICAgZ3Jhdml0eTogbmV3IENBTk5PTi5WZWMzKDAsIC05LjgyLCAwKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHdvcmxkLmRlZmF1bHRDb250YWN0TWF0ZXJpYWwuZnJpY3Rpb24gPSAwLjA7XG4gICAgICAgIHdvcmxkLmRlZmF1bHRDb250YWN0TWF0ZXJpYWwucmVzdGl0dXRpb24gPSAwLjA7XG5cbiAgICAgICAgLy8gbGV0IGN1YmVCb2R5czogQ0FOTk9OLkJvZHlbXSA9IFtdO1xuICAgICAgICAvLyAvLyDniannkIbnqbrplpMgQm9444Gu5L2c5oiQXG4gICAgICAgIC8vIHRoaXMuY3ViZU51bSA9IDUwO1xuICAgICAgICAvLyBmb3IobGV0IGk9MDsgaTx0aGlzLmN1YmVOdW07IGkrKyl7XG4gICAgICAgIC8vIGNvbnN0IGN1YmVTaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMygwLjM1LCAwLjUsIDAuMSkpO1xuICAgICAgICAvLyBjb25zdCBjdWJlTWF0ZXJpYWwgPSBuZXcgQ0FOTk9OLk1hdGVyaWFsKHsgZnJpY3Rpb246IDAuMDIsIHJlc3RpdHV0aW9uOiAwLjAgfSk7XG4gICAgICAgIC8vIGN1YmVCb2R5c1tpXSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDEgLCBtYXRlcmlhbDogY3ViZU1hdGVyaWFsIH0pO1xuICAgICAgICAvLyBjdWJlQm9keXNbaV0uYWRkU2hhcGUoY3ViZVNoYXBlKTtcblxuICAgICAgICAvLyB9XG5cbiAgICAgICAgbGV0IHdhbGxCb2R5czogQ0FOTk9OLkJvZHlbXSA9IFtdO1xuICAgICAgICAvLyDniannkIbnqbrplpMg5aOB44Gu5L2c5oiQXG4gICAgICAgIHRoaXMud2FsbE51bSA9OTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLndhbGxOdW07IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgd2FsbFNoYXBlcyA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMygwLjM1LCAwLjUsIDAuMSkpO1xuICAgICAgICAgICAgd2FsbEJvZHlzW2ldID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMCB9KTtcbiAgICAgICAgICAgIHdhbGxCb2R5c1tpXS5hZGRTaGFwZSh3YWxsU2hhcGVzKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgXG5cbiAgICAgICAgLy8g54mp55CG56m66ZaTIOatouOBvuOCi+WjgeOBruS9nOaIkFxuICAgICAgICBjb25zdCBzdG9wU2hhcGUgPSBuZXcgQ0FOTk9OLkJveChuZXcgQ0FOTk9OLlZlYzMoMTAsIDEuNSwgMC4zKSk7XG4gICAgICAgIHRoaXMuc3RvcEJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAwIH0pO1xuICAgICAgICB0aGlzLnN0b3BCb2R5LmFkZFNoYXBlKHN0b3BTaGFwZSk7XG5cbiAgICAgICAgLy8g54mp55CG56m66ZaTIOOCtOODvOODq+OBruS9nOaIkFxuICAgICAgICBjb25zdCBnb2FsU2hhcGUgPSBuZXcgQ0FOTk9OLkJveChuZXcgQ0FOTk9OLlZlYzMoMSwgMS41LCAwLjMpKTtcbiAgICAgICAgdGhpcy5nb2FsQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDAgfSk7XG4gICAgICAgIHRoaXMuZ29hbEJvZHkuYWRkU2hhcGUoZ29hbFNoYXBlKTtcblxuICAgICAgICAvLyDniannkIbnqbrplpMgUGxhbmXjga7kvZzmiJBcbiAgICAgICAgY29uc3QgcGxhbmVTaGFwZSA9IG5ldyBDQU5OT04uUGxhbmUoKTtcbiAgICAgICAgdGhpcy5wbGFuZUJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAwIH0pO1xuICAgICAgICB0aGlzLnBsYW5lQm9keS5hZGRTaGFwZShwbGFuZVNoYXBlKTtcblxuICAgICAgICAvLyDniannkIbnqbrplpMg44Oc44O844Or44Gu5L2c5oiQXG4gICAgICAgIGNvbnN0IGJhbGxTaGFwZSA9IG5ldyBDQU5OT04uU3BoZXJlKDAuNCk7XG4gICAgICAgIGNvbnN0IGJhbGxCb2R5ID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMSB9KTtcbiAgICAgICAgYmFsbEJvZHkuYWRkU2hhcGUoYmFsbFNoYXBlKTtcblxuICAgICAgICAvLyBCb3jjga7kvZzmiJBcbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMC43LCAxLCAwLjIpO1xuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiAweEU1OUJEQSB9KTtcbiAgICAgICAgLy8gZm9yKGxldCBpPTA7IGk8dGhpcy5jdWJlTnVtOyBpKyspe1xuICAgICAgICAvLyAgICAgY29uc3QgcmFkaXVzID0gNjtcbiAgICAgICAgLy8gICAgIGNvbnN0IHRoZXRhID0gTWF0aC5QSSAqIDIgKiBpIC8gdGhpcy5jdWJlTnVtO1xuICAgICAgICAvLyAgICAgY29uc3QgY2lyY2xlWCA9IHJhZGl1cyAqIE1hdGguY29zKHRoZXRhKTtcbiAgICAgICAgLy8gICAgIGNvbnN0IGNpcmNsZVogPSByYWRpdXMgKiBNYXRoLnNpbih0aGV0YSk7XG4gICAgICAgIC8vIGN1YmVzW2ldID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgLy8gY3ViZXNbaV0ucG9zaXRpb24ueCA9IGNpcmNsZVg7XG4gICAgICAgIC8vIGN1YmVzW2ldLnBvc2l0aW9uLnkgPSA1O1xuICAgICAgICAvLyBjdWJlc1tpXS5wb3NpdGlvbi56ID0gY2lyY2xlWjtcbiAgICAgICAgLy8gY3ViZXNbaV0ucm90YXRpb24ueSA9IC0gTWF0aC5QSSAqIDIgKiBpIC8gdGhpcy5jdWJlTnVtO1xuICAgICAgICAvLyBpZihpID09PSAwKXtcbiAgICAgICAgLy8gY3ViZXNbaV0ucm90YXRpb24ueCA9IDAuNTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyB0aGlzLnNjZW5lLmFkZChjdWJlc1tpXSk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBsZXQgd2FsbE1lc2hzOiBUSFJFRS5NZXNoW10gPSBbXTtcblxuICAgICAgICAvLyDlo4Hjga7kvZzmiJBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLndhbGxOdW07IGkrKykge1xuICAgICAgICAgICAgd2FsbE1lc2hzW2ldID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5wb3NpdGlvbi55ID0gMjtcbiAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5wb3NpdGlvbi54ID0gMiAqIGkgLSA4O1xuICAgICAgICAgICAgd2FsbE1lc2hzW2ldLnJvdGF0aW9uLnggPSBNYXRoLlBJIC8gMiAtIDQwO1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQod2FsbE1lc2hzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOatouOBvuOCi+WjgeOBruS9nOaIkFxuICAgICAgICBjb25zdCBzdG9wR2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMjAsIDMsIDAuNik7XG4gICAgICAgIGNvbnN0IHN0b3BNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiAweEU1OUJEQSB9KTtcbiAgICAgICAgY29uc3Qgc3RvcE1lc2ggPSBuZXcgVEhSRUUuTWVzaChzdG9wR2VvbWV0cnksIHN0b3BNYXRlcmlhbCk7XG4gICAgICAgIHN0b3BNZXNoLnBvc2l0aW9uLno9IDEwO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChzdG9wTWVzaCk7XG5cbiAgICAgICAgLy8g44K044O844Or44Gu5L2c5oiQXG4gICAgICAgIGNvbnN0IGdvYWxHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgyLCAzLCAwLjYpO1xuICAgICAgICBjb25zdCBnb2FsTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoeyBjb2xvcjogMHhkMmI0OGMgfSk7XG4gICAgICAgIHRoaXMuZ29hbE1lc2ggPSBuZXcgVEhSRUUuTWVzaChnb2FsR2VvbWV0cnksIGdvYWxNYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuZ29hbE1lc2gucG9zaXRpb24uej0gODtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5nb2FsTWVzaCk7XG5cblxuICAgICAgICAvLyBQbGFuZeOBruS9nOaIkFxuICAgICAgICBjb25zdCBwaG9uZ01hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4RTVERTlCIH0pO1xuICAgICAgICBjb25zdCBwbGFuZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMjUsIDI1KTtcbiAgICAgICAgY29uc3QgcGxhbmVNZXNoID0gbmV3IFRIUkVFLk1lc2gocGxhbmVHZW9tZXRyeSwgcGhvbmdNYXRlcmlhbCk7XG4gICAgICAgIHBsYW5lTWVzaC5tYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTsgLy8g5Lih6Z2iXG4gICAgICAgIHBsYW5lTWVzaC5yb3RhdGVYKC1NYXRoLlBJIC8gMik7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHBsYW5lTWVzaCk7XG5cbiAgICAgICAgLy8g44Oc44O844Or44Gu5L2c5oiQXG4gICAgICAgIGNvbnN0IGJhbGxHZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjQsIDMyLCAxNik7XG4gICAgICAgIGNvbnN0IGJhbGxNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTm9ybWFsTWF0ZXJpYWwoKTtcbiAgICAgICAgY29uc3Qgc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goYmFsbEdlb21ldHJ5LCBiYWxsTWF0ZXJpYWwpO1xuICAgICAgICBzcGhlcmUucG9zaXRpb24ueSA9IDQ7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHNwaGVyZSk7XG5cbiAgICAgICAgLy8gQm94IOe0kOOBpeOBkVxuICAgICAgICAvLyBmb3IobGV0IGk9MDsgaTx0aGlzLmN1YmVOdW07IGkrKyl7XG4gICAgICAgIC8vIGN1YmVCb2R5c1tpXS5wb3NpdGlvbi5zZXQoY3ViZXNbaV0ucG9zaXRpb24ueCwgY3ViZXNbaV0ucG9zaXRpb24ueSwgY3ViZXNbaV0ucG9zaXRpb24ueik7XG4gICAgICAgIC8vIGN1YmVCb2R5c1tpXS5xdWF0ZXJuaW9uLnNldChjdWJlc1tpXS5xdWF0ZXJuaW9uLngsIGN1YmVzW2ldLnF1YXRlcm5pb24ueSwgY3ViZXNbaV0ucXVhdGVybmlvbi56LCBjdWJlc1tpXS5xdWF0ZXJuaW9uLncpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLndhbGxOdW07IGkrKykge1xuICAgICAgICAgICAgLy8g5aOBIOe0kOOBpeOBkVxuICAgICAgICAgICAgd2FsbEJvZHlzW2ldLnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICB3YWxsTWVzaHNbaV0ucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICB3YWxsTWVzaHNbaV0ucG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICB3YWxsTWVzaHNbaV0ucG9zaXRpb24uelxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHdhbGxCb2R5c1tpXS5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgICAgICB3YWxsTWVzaHNbaV0ucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgICAgIHdhbGxNZXNoc1tpXS5xdWF0ZXJuaW9uLnksXG4gICAgICAgICAgICAgICAgd2FsbE1lc2hzW2ldLnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgICAgICB3YWxsTWVzaHNbaV0ucXVhdGVybmlvbi53XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5q2i44G+44KL5aOBIOe0kOOBpeOBkVxuICAgICAgICB0aGlzLnN0b3BCb2R5LnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgIHN0b3BNZXNoLnBvc2l0aW9uLngsXG4gICAgICAgICAgICBzdG9wTWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgc3RvcE1lc2gucG9zaXRpb24uelxuICAgICAgICApO1xuICAgICAgICB0aGlzLnN0b3BCb2R5LnF1YXRlcm5pb24uc2V0KFxuICAgICAgICAgICAgc3RvcE1lc2gucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgc3RvcE1lc2gucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgc3RvcE1lc2gucXVhdGVybmlvbi56LFxuICAgICAgICAgICAgc3RvcE1lc2gucXVhdGVybmlvbi53XG4gICAgICAgICk7XG5cbiAgICAgICAgIC8vIOOCtOODvOODqyDntJDjgaXjgZFcbiAgICAgICAgIHRoaXMuZ29hbEJvZHkucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5wb3NpdGlvbi54LFxuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5wb3NpdGlvbi56XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZ29hbEJvZHkucXVhdGVybmlvbi5zZXQoXG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnF1YXRlcm5pb24ueCxcbiAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5xdWF0ZXJuaW9uLnosXG4gICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnF1YXRlcm5pb24ud1xuICAgICAgICApO1xuXG4gICAgICAgIC8vIHBsYW5lIOe0kOOBpeOBkVxuICAgICAgICB0aGlzLnBsYW5lQm9keS5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICBwbGFuZU1lc2gucG9zaXRpb24ueCxcbiAgICAgICAgICAgIHBsYW5lTWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgcGxhbmVNZXNoLnBvc2l0aW9uLnpcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wbGFuZUJvZHkucXVhdGVybmlvbi5zZXQoXG4gICAgICAgICAgICBwbGFuZU1lc2gucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgcGxhbmVNZXNoLnF1YXRlcm5pb24ueSxcbiAgICAgICAgICAgIHBsYW5lTWVzaC5xdWF0ZXJuaW9uLnosXG4gICAgICAgICAgICBwbGFuZU1lc2gucXVhdGVybmlvbi53XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8g44Oc44O844OrIOe0kOOBpeOBkVxuICAgICAgICBiYWxsQm9keS5wb3NpdGlvbi5zZXQoXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueCxcbiAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi55LFxuICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnpcbiAgICAgICAgKTtcbiAgICAgICAgYmFsbEJvZHkucXVhdGVybmlvbi5zZXQoXG4gICAgICAgICAgICBzcGhlcmUucXVhdGVybmlvbi54LFxuICAgICAgICAgICAgc3BoZXJlLnF1YXRlcm5pb24ueSxcbiAgICAgICAgICAgIHNwaGVyZS5xdWF0ZXJuaW9uLnosXG4gICAgICAgICAgICBzcGhlcmUucXVhdGVybmlvbi53XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8g6L+95YqgXG4gICAgICAgIHdvcmxkLmFkZEJvZHkodGhpcy5wbGFuZUJvZHkpO1xuICAgICAgICAvLyBmb3IobGV0IGk9MDsgaTx0aGlzLmN1YmVOdW07IGkrKyl7XG4gICAgICAgIC8vIHdvcmxkLmFkZEJvZHkoY3ViZUJvZHlzW2ldKTtcbiAgICAgICAgLy8gfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2FsbE51bTsgaSsrKSB7XG4gICAgICAgICAgICB3b3JsZC5hZGRCb2R5KHdhbGxCb2R5c1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd29ybGQuYWRkQm9keShiYWxsQm9keSk7XG4gICAgICAgIHdvcmxkLmFkZEJvZHkodGhpcy5zdG9wQm9keSk7XG4gICAgICAgIHdvcmxkLmFkZEJvZHkodGhpcy5nb2FsQm9keSk7XG5cbiAgICAgICAgLy8gLy8g44Kw44Oq44OD44OJ6KGo56S6XG4gICAgICAgIC8vIGNvbnN0IGdyaWRIZWxwZXIgPSBuZXcgVEhSRUUuR3JpZEhlbHBlcigxMCk7XG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYWRkKGdyaWRIZWxwZXIpO1xuXG4gICAgICAgIC8vIC8vIOi7uOihqOekulxuICAgICAgICAvLyBjb25zdCBheGVzSGVscGVyID0gbmV3IFRIUkVFLkF4ZXNIZWxwZXIoNSk7XG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYWRkKGF4ZXNIZWxwZXIpO1xuXG4gICAgICAgIC8v44Op44Kk44OI44Gu6Kit5a6aXG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZik7XG4gICAgICAgIGNvbnN0IGx2ZWMgPSBuZXcgVEhSRUUuVmVjdG9yMygxLCAxLCAxKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQobHZlYy54LCBsdmVjLnksIGx2ZWMueik7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMubGlnaHQpO1xuXG4gICAgICAgIGNvbnN0IGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4gICAgICAgIGxldCB1cGRhdGU6IEZyYW1lUmVxdWVzdENhbGxiYWNrID0gKHRpbWUpID0+IHtcbiAgICAgICAgY29uc3QgZGVsdGFUaW1lID0gY2xvY2suZ2V0RGVsdGEoKTtcbiAgICAgICAgICAgIC8vIOW6p+aomeOBruabtOaWsFxuICAgICAgICAgICAgd29ybGQuZml4ZWRTdGVwKCk7XG4gICAgICAgICAgICAvLyBmb3IobGV0IGk9MDsgaTx0aGlzLmN1YmVOdW07IGkrKyl7XG4gICAgICAgICAgICAvLyBjdWJlc1tpXS5wb3NpdGlvbi5zZXQoY3ViZUJvZHlzW2ldLnBvc2l0aW9uLngsIGN1YmVCb2R5c1tpXS5wb3NpdGlvbi55LCBjdWJlQm9keXNbaV0ucG9zaXRpb24ueik7XG4gICAgICAgICAgICAvLyBjdWJlc1tpXS5xdWF0ZXJuaW9uLnNldChjdWJlQm9keXNbaV0ucXVhdGVybmlvbi54LCBjdWJlQm9keXNbaV0ucXVhdGVybmlvbi55LCBjdWJlQm9keXNbaV0ucXVhdGVybmlvbi56LCBjdWJlQm9keXNbaV0ucXVhdGVybmlvbi53KTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnNldChcbiAgICAgICAgICAgICAgICBiYWxsQm9keS5wb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIGJhbGxCb2R5LnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgYmFsbEJvZHkucG9zaXRpb24uelxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHNwaGVyZS5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgICAgICBiYWxsQm9keS5xdWF0ZXJuaW9uLngsXG4gICAgICAgICAgICAgICAgYmFsbEJvZHkucXVhdGVybmlvbi55LFxuICAgICAgICAgICAgICAgIGJhbGxCb2R5LnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgICAgICBiYWxsQm9keS5xdWF0ZXJuaW9uLndcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucG9zaXRpb24uc2V0KFxuICAgICAgICAgICAgICAgIHRoaXMuZ29hbEJvZHkucG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICB0aGlzLmdvYWxCb2R5LnBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgdGhpcy5nb2FsQm9keS5wb3NpdGlvbi56XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5xdWF0ZXJuaW9uLnNldChcbiAgICAgICAgICAgICAgICB0aGlzLmdvYWxCb2R5LnF1YXRlcm5pb24ueCxcbiAgICAgICAgICAgICAgICB0aGlzLmdvYWxCb2R5LnF1YXRlcm5pb24ueSxcbiAgICAgICAgICAgICAgICB0aGlzLmdvYWxCb2R5LnF1YXRlcm5pb24ueixcbiAgICAgICAgICAgICAgICB0aGlzLmdvYWxCb2R5LnF1YXRlcm5pb24ud1xuICAgICAgICAgICAgKTtcblxuXG4gICAgICAgICAgICBiYWxsQm9keS5hZGRFdmVudExpc3RlbmVyKFwiY29sbGlkZVwiLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIOihneeqgeebuOaJi+OBruODnOODh+OCo+OCkuWPluW+l1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpZGVkQm9keSA9XG4gICAgICAgICAgICAgICAgICAgIGUuY29udGFjdC5iaS5pZCA9PT0gYmFsbEJvZHkuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZS5jb250YWN0LmJqXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGUuY29udGFjdC5iaTtcblxuICAgICAgICAgICAgICAgIC8vIHBsYW5lQm9keeOBqOOBruihneeqgeaZguOBruOBv+WHpueQhuOCkuWun+ihjFxuICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlZEJvZHkuaWQgPT09IHRoaXMuc3RvcEJvZHkuaWQgfHwgY29sbGlkZWRCb2R5LmlkID09PSB0aGlzLmdvYWxCb2R5LmlkICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5kb20gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA5KSAqIDIgLSA4O1xuICAgICAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi54ID0gcmFuZG9tO1xuICAgICAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueSA9IDQ7XG4gICAgICAgICAgICAgICAgICAgIGJhbGxCb2R5LnBvc2l0aW9uLnggPSByYW5kb207XG4gICAgICAgICAgICAgICAgICAgIGJhbGxCb2R5LnBvc2l0aW9uLnogPSAwO1xuICAgICAgICAgICAgICAgICAgICBiYWxsQm9keS5wb3NpdGlvbi55ID0gNDtcbiAgICAgICAgICAgICAgICAgICAgYmFsbEJvZHkudmVsb2NpdHkuc2V0KDAsIC01LCAwKTsgLy8g6YCf5bqm44KS44Oq44K744OD44OIXG4gICAgICAgICAgICAgICAgICAgIGJhbGxCb2R5LmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7IC8vIOinkumAn+W6puOCkuODquOCu+ODg+ODiFxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5ib2R5ID09PSB0aGlzLmdvYWxCb2R5ICYmICF0aGlzLmlzQ29sbGlkaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxpZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY291bnQpO1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDb2xsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5jb2xsaXNpb25Db29sZG93bik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBnZW9tID0gPFRIUkVFLkJ1ZmZlckdlb21ldHJ5PnRoaXMuY2xvdWQuZ2VvbWV0cnk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBnZW9tLmdldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIpOyAvLyDluqfmqJnjg4fjg7zjgr9cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZVZlbG9jaXR5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25zLnNldFgoXG4gICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5nZXRYKGkpICsgdGhpcy5wYXJ0aWNsZVZlbG9jaXR5W2ldLnggKiAxMDAgKiBkZWx0YVRpbWVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbnMuZ2V0WShpKSArIHRoaXMucGFydGljbGVWZWxvY2l0eVtpXS55IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMuc2V0WShpLCAyMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLnNldFkoXG4gICAgICAgICAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLmdldFkoaSkgKyB0aGlzLnBhcnRpY2xlVmVsb2NpdHlbaV0ueSAqIDEwMCAqIGRlbHRhVGltZVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMuc2V0WihcbiAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLmdldFooaSkgKyB0aGlzLnBhcnRpY2xlVmVsb2NpdHlbaV0ueiAqIDEwMCAqIGRlbHRhVGltZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBvc2l0aW9ucy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICB9O1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdCk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IG5ldyBUaHJlZUpTQ29udGFpbmVyKCk7XG5cbiAgICBsZXQgdmlld3BvcnQgPSBjb250YWluZXIuY3JlYXRlUmVuZGVyZXJET00oXG4gICAgICAgIDY0MCxcbiAgICAgICAgNDgwLFxuICAgICAgICBuZXcgVEhSRUUuVmVjdG9yMygxMCwgMTAsIDEwKVxuICAgICk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2aWV3cG9ydCk7XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJtYWluXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua2NncHJlbmRlcmluZ1wiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjZ3ByZW5kZXJpbmdcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvcnMtbm9kZV9tb2R1bGVzX2Nhbm5vbi1lc19kaXN0X2Nhbm5vbi1lc19qcy1ub2RlX21vZHVsZXNfdGhyZWVfZXhhbXBsZXNfanNtX2NvbnRyb2xzX09yYi1lNThiZDJcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=