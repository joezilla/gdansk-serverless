// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT MODIFY IT.

import { Asset, Entry } from "contentful";
import { Document } from "@contentful/rich-text-types";

export interface IAuthorFields {
  /** Name */
  name: string;

  /** Picture */
  picture: Asset;
}

export interface IAuthor extends Entry<IAuthorFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "author";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface ICityFields {
  /** Name */
  name?: string | undefined;
}

export interface ICity extends Entry<ICityFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "city";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IImageWithFocalPointFields {
  /** Title */
  title: string;

  /** Image */
  image: Asset;

  /** Focal point */
  focalPoint: Record<string, any>;
}

export interface IImageWithFocalPoint
  extends Entry<IImageWithFocalPointFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "imageWithFocalPoint";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IPersonFields {
  /** Name */
  name: string;

  /** birthDate */
  birthDate?: string | undefined;

  /** bornIn */
  bornIn?: ICity | undefined;

  /** deathDate */
  deathDate?: string | undefined;

  /** diedIn */
  diedIn?: ICity | undefined;

  /** description */
  description?: Document | undefined;

  /** pictures */
  pictures?: Asset[] | undefined;

  /** livedAt */
  livedAt?: IStreet[] | undefined;
}

/** A person */

export interface IPerson extends Entry<IPersonFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "person";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IPostFields {
  /** Title */
  title: string;

  /** Slug */
  slug: string;

  /** Content */
  content: Document;

  /** Excerpt */
  excerpt: string;

  /** Cover Image */
  coverImage: Asset;

  /** Date */
  date: string;

  /** Author */
  author: IAuthor;

  /** showIn */
  showIn?: ("Homepage" | "Navigation" | "Search")[] | undefined;
}

export interface IPost extends Entry<IPostFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "post";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IStreetFields {
  /** German Name */
  germanName: string;

  /** Polish Names */
  polishNames?: string[] | undefined;

  /** District */
  district?: string | undefined;

  /** Previous Names */
  previousNames?: string | undefined;

  /** History */
  history?: Document | undefined;

  /** Source */
  source?: string | undefined;

  /** City */
  city?: Entry<{ [fieldId: string]: unknown }> | undefined;

  /** images */
  images?: Asset[] | undefined;
}

export interface IStreet extends Entry<IStreetFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "street";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface ITestFields {
  /** images */
  images?: Asset[] | undefined;
}

export interface ITest extends Entry<ITestFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "test";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export type CONTENT_TYPE =
  | "author"
  | "city"
  | "imageWithFocalPoint"
  | "person"
  | "post"
  | "street"
  | "test";

export type LOCALE_CODE = "de" | "en-US";

export type CONTENTFUL_DEFAULT_LOCALE_CODE = "en-US";
