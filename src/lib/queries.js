import { supabase } from "./supabaseClient";
import { cached, peek, setCache, cacheKey, invalidate } from "./cache";
import { serviceSlug } from "./content";

const LIST_TTL = 2 * 60 * 1000;
const DETAIL_TTL = 5 * 60 * 1000;
const SETTINGS_TTL = 5 * 60 * 1000;

export function getSiteSettings() {
  return cached(
    "settings",
    async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      return data ?? null;
    },
    SETTINGS_TTL,
  );
}

export function peekSiteSettings() {
  return peek("settings");
}

export function peekBuildingTypes() {
  return peek("building-types");
}

export function peekBuildings({ featuredOnly = false, typeSlug = null } = {}) {
  return peek(cacheKey(["buildings", featuredOnly ? "featured" : "all", typeSlug || "any"]));
}

export function peekProducts(categorySlug = null) {
  return peek(cacheKey(["products", categorySlug || "all"]));
}

export function peekProductCategories() {
  return peek("product-categories");
}

export function peekServices() {
  return peek("services");
}

export function peekPosts() {
  return peek("posts");
}

export function peekGalleryImages() {
  return peek("gallery");
}

export function peekBoardMembers() {
  return peek("board");
}

export function peekFeaturedProducts() {
  return peek("products:featured");
}

export function getBuildingTypes() {
  return cached("building-types", async () => {
    const { data } = await supabase
      .from("building_types")
      .select("*")
      .order("sort_order", { ascending: true });
    return data ?? [];
  });
}

export function getBuildings({ featuredOnly = false, typeSlug = null } = {}) {
  const key = cacheKey(["buildings", featuredOnly ? "featured" : "all", typeSlug || "any"]);
  return cached(key, async () => {
    let typeId = null;
    if (typeSlug) {
      const { data: typeData, error } = await supabase
        .from("building_types")
        .select("id")
        .eq("slug", typeSlug)
        .single();
      if (error) return [];
      typeId = typeData?.id;
    }

    let query = supabase
      .from("buildings")
      .select("*, building_types(name, slug)")
      .order("sort_order", { ascending: true });

    if (featuredOnly) query = query.eq("featured", true);
    if (typeId) query = query.eq("type_id", typeId);

    const { data } = await query;
    const list = data ?? [];
    list.forEach((building) => {
      if (building?.slug) setCache(cacheKey(["building", building.slug]), building, DETAIL_TTL);
    });
    return list;
  }, LIST_TTL);
}

export function peekBuilding(slug) {
  return peek(cacheKey(["building", slug]));
}

export function getBuilding(slug) {
  if (!slug) return Promise.resolve(null);
  return cached(
    cacheKey(["building", slug]),
    async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*, building_types(name, slug)")
        .eq("slug", slug)
        .single();
      if (error) return null;
      return data;
    },
    DETAIL_TTL,
  );
}

export function peekBuildingImages(id) {
  return peek(cacheKey(["building-images", id]));
}

export function getBuildingImages(id) {
  if (!id) return Promise.resolve([]);
  return cached(
    cacheKey(["building-images", id]),
    async () => {
      const { data } = await supabase
        .from("building_images")
        .select("*")
        .eq("building_id", id)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    DETAIL_TTL,
  );
}

export function prefetchBuilding(slug) {
  if (!slug) return;
  getBuilding(slug).then((building) => {
    if (building?.id) getBuildingImages(building.id);
  });
}

export function getProductCategories() {
  return cached("product-categories", async () => {
    const { data } = await supabase.from("product_categories").select("*").order("sort_order");
    return data ?? [];
  });
}

export function getProducts(categorySlug = null) {
  const key = cacheKey(["products", categorySlug || "all"]);
  return cached(key, async () => {
    let categoryId = null;
    if (categorySlug) {
      const { data: categoryData, error } = await supabase
        .from("product_categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      if (error) return [];
      categoryId = categoryData?.id;
    }

    let query = supabase
      .from("products")
      .select("*, product_categories(name, slug)")
      .order("sort_order");

    if (categoryId) query = query.eq("category_id", categoryId);

    const { data } = await query;
    const list = data ?? [];
    list.forEach((product) => {
      if (product?.slug) setCache(cacheKey(["product", product.slug]), product, DETAIL_TTL);
    });
    return list;
  }, LIST_TTL);
}

export function peekProduct(slug) {
  return peek(cacheKey(["product", slug]));
}

export function getProduct(slug) {
  if (!slug) return Promise.resolve(null);
  return cached(
    cacheKey(["product", slug]),
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(name, slug)")
        .eq("slug", slug)
        .single();
      if (error) return null;
      return data;
    },
    DETAIL_TTL,
  );
}

export function prefetchProduct(slug) {
  if (slug) getProduct(slug);
}

export function getServices() {
  return cached("services", async () => {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    const list = data ?? [];
    list.forEach((service) => {
      const slug = serviceSlug(service);
      if (slug) setCache(cacheKey(["service", slug]), service, DETAIL_TTL);
    });
    return list;
  }, LIST_TTL);
}

export function peekService(slug) {
  return peek(cacheKey(["service", slug]));
}

export function getService(slug) {
  if (!slug) return Promise.resolve(null);
  const hit = peek(cacheKey(["service", slug]));
  if (hit) return Promise.resolve(hit);
  return getServices().then(
    (list) => (list ?? []).find((s) => serviceSlug(s) === slug || String(s.id) === slug) ?? null,
  );
}

export function prefetchService(slug) {
  if (slug) getService(slug);
}

export function getPosts() {
  return cached("posts", async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    const list = data ?? [];
    list.forEach((post) => {
      if (post?.slug) setCache(cacheKey(["post", post.slug]), post, DETAIL_TTL);
    });
    return list;
  }, LIST_TTL);
}

export function peekPost(slug) {
  return peek(cacheKey(["post", slug]));
}

export function getPost(slug) {
  if (!slug) return Promise.resolve(null);
  return cached(
    cacheKey(["post", slug]),
    async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) return null;
      return data;
    },
    DETAIL_TTL,
  );
}

export function prefetchPost(slug) {
  if (slug) getPost(slug);
}

export function getGalleryImages() {
  return cached("gallery", async () => {
    const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
    return data ?? [];
  }, LIST_TTL);
}

export function getBoardMembers() {
  return cached("board", async () => {
    const { data } = await supabase.from("board_members").select("*").order("sort_order");
    return data ?? [];
  }, LIST_TTL);
}

export function getFeaturedProducts() {
  return cached("products:featured", async () => {
    const { data } = await supabase
      .from("products")
      .select("*, product_categories(name)")
      .eq("featured", true)
      .limit(3);
    const list = data ?? [];
    list.forEach((product) => {
      if (product?.slug) setCache(cacheKey(["product", product.slug]), product, DETAIL_TTL);
    });
    return list;
  }, LIST_TTL);
}

export { invalidate };
